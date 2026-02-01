"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { processUserSummarization } from "@/lib/orchestrator";

export async function getUserPreferences() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    let preferences = await prisma.userPreferences.findUnique({
        where: { userId: session.user.id }
    });

    if (!preferences) {
        preferences = await prisma.userPreferences.create({
            data: {
                userId: session.user.id,
                notificationChannel: "slack",
                language: "zh",
                automationEnabled: false,
                summaryTime: "08:00",
            }
        });
    }

    return preferences;
}

export async function updateUserPreferences(prevState, formData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const notificationChannel = formData.get("notificationChannel");
        const whatsappPhone = formData.get("whatsappPhone");
        const slackWebhookUrl = formData.get("slackWebhookUrl");
        const telegramChatId = formData.get("telegramChatId");
        const language = formData.get("language");
        const automationEnabled = formData.get("automationEnabled") === "on";
        const summaryTime = formData.get("summaryTime");
        const timezone = formData.get("timezone");

        await prisma.userPreferences.upsert({
            where: { userId: session.user.id },
            update: {
                notificationChannel,
                whatsappPhone,
                slackWebhookUrl,
                telegramChatId,
                language,
                automationEnabled,
                summaryTime,
                timezone,
            },
            create: {
                userId: session.user.id,
                notificationChannel,
                whatsappPhone,
                slackWebhookUrl,
                telegramChatId,
                language,
                automationEnabled,
                summaryTime,
                timezone,
            },
        });

        revalidatePath("/dashboard");
        return { success: true, message: "Preferences updated successfully." };
    } catch (error) {
        console.error("Update preferences error:", error);
        return { error: "Failed to update preferences." };
    }
}

export async function runEmailSummarization() {
    console.log("[Action] Starting runEmailSummarization...");
    const session = await auth();
    if (!session?.user?.id) {
        console.error("[Action] No session found");
        throw new Error("Unauthorized");
    }
    console.log("[Action] Session found for user:", session.user.id);

    try {
        const result = await processUserSummarization(session.user.id);
        console.log("[Action] Summarization result:", result.success ? "Success" : "Failed");
        return result;
    } catch (error) {
        console.error("[Action] Summarization error:", error);
        return { success: false, error: error.message };
    }
}

export async function getSummaryHistory() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await prisma.summaryHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10
    });
}
