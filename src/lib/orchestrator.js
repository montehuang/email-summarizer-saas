import prisma from "./prisma";
import { fetchRecentEmails, markEmailsAsRead } from "./gmail";
import { summarizeEmails as aiSummarize } from "./ai";
import { sendSlackNotification, sendWhatsAppNotification, sendTelegramNotification } from "./notifier";

export async function processUserSummarization(userId) {
    try {
        console.log(`[Orchestrator] Processing for user: ${userId}`);
        const preferences = await prisma.userPreferences.findUnique({
            where: { userId }
        });

        if (!preferences) {
            console.error(`[Orchestrator] Preferences not found for user ${userId}`);
            throw new Error(`Preferences not found for user ${userId}`);
        }

        // 1. Fetch unread emails
        console.log("[Orchestrator] Fetching emails...");
        const emails = await fetchRecentEmails(userId);
        console.log(`[Orchestrator] Found ${emails.length} unread emails`);

        if (emails.length === 0) {
            return { success: true, message: "No unread emails to summarize.", count: 0 };
        }

        // 2. Generate AI Summary
        console.log("[Orchestrator] Generating AI summary...");
        const summary = await aiSummarize(emails, preferences.language, preferences);
        console.log("[Orchestrator] AI summary generated");

        // 3. Send Notifications
        console.log("[Orchestrator] Sending notifications...");
        const channels = [];
        if (preferences.notificationChannel === "slack" && preferences.slackWebhookUrl) {
            await sendSlackNotification(preferences.slackWebhookUrl, summary);
            channels.push("slack");
            console.log("[Orchestrator] Slack notification sent");
        } else if (preferences.notificationChannel === "whatsapp" && preferences.whatsappPhone) {
            await sendWhatsAppNotification(preferences.whatsappPhone, summary);
            channels.push("whatsapp");
            console.log("[Orchestrator] WhatsApp notification sent");
        } else if (preferences.notificationChannel === "telegram" && preferences.telegramChatId) {
            await sendTelegramNotification(preferences.telegramChatId, summary);
            channels.push("telegram");
            console.log("[Orchestrator] Telegram notification sent");
        }

        // 4. Mark as Read
        console.log("[Orchestrator] Marking emails as read...");
        const messageIds = emails.map(e => e.id);
        await markEmailsAsRead(userId, messageIds);
        console.log("[Orchestrator] Emails marked as read");

        // 5. Log Success History
        await prisma.summaryHistory.create({
            data: {
                userId,
                result: "Success",
                count: emails.length,
                channels: channels.join(", "),
                summary: summary.substring(0, 500) + (summary.length > 500 ? "..." : "")
            }
        });

        return {
            success: true,
            summary,
            count: emails.length
        };
    } catch (error) {
        console.error(`[Orchestrator] Error for user ${userId}:`, error);

        // Log Error History
        await prisma.summaryHistory.create({
            data: {
                userId,
                result: `Error: ${error.message}`,
                count: 0
            }
        });

        throw error;
    }
}
