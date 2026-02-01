import prisma from "@/lib/prisma";
import { processUserSummarization } from "@/lib/orchestrator";

export async function GET(request) {
    const authHeader = request.headers.get("authorization");

    // Security check to ensure only authorized cron service can call this
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // Find all users who have automation enabled
        const allUsers = await prisma.userPreferences.findMany({
            where: { automationEnabled: true },
            select: { userId: true, summaryTime: true, timezone: true }
        });

        const now = new Date();
        const usersToSummarize = allUsers.filter(user => {
            if (!user.summaryTime) return false;

            // Get current time in user's timezone using a stable formatter
            const formatter = new Intl.DateTimeFormat("en-GB", {
                timeZone: user.timezone || "UTC",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });

            const parts = formatter.formatToParts(now);
            const hh = parseInt(parts.find(p => p.type === "hour").value);
            const mm = parseInt(parts.find(p => p.type === "minute").value);

            const [targetH, targetM] = user.summaryTime.split(":").map(Number);

            // Robust check: Trigger if the current hour matches AND 
            // the current minute is within [targetM, targetM + 14]
            // This ensures a cron running every 15 mins will always catch the user.
            const isMatch = hh === targetH && mm >= targetM && mm < targetM + 15;

            console.log(`[Cron] Checking user: ${user.userId}, Local: ${hh}:${mm}, Target: ${user.summaryTime}, Match: ${isMatch}`);

            return isMatch;
        });

        const results = await Promise.allSettled(
            usersToSummarize.map(user => processUserSummarization(user.userId))
        );

        return Response.json({
            processed: usersToSummarize.length,
            details: results.map((r, i) => ({
                userId: usersToSummarize[i].userId,
                status: r.status,
                ...(r.status === "fulfilled" ? { result: r.value } : { error: r.reason.message })
            }))
        });
    } catch (error) {
        console.error("Cron summarization error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
