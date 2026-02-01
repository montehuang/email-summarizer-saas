import { google } from "googleapis";
import prisma from "./prisma";

export async function getGmailClient(userId) {
    const account = await prisma.account.findFirst({
        where: { userId, provider: "google" },
    });

    if (!account || !account.access_token) {
        throw new Error("Google account not linked or access token missing");
    }

    const auth = new google.auth.OAuth2(
        process.env.AUTH_GOOGLE_ID,
        process.env.AUTH_GOOGLE_SECRET
    );

    auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    return google.gmail({ version: "v1", auth });
}

export async function fetchRecentEmails(userId, maxResults = 20) {
    const gmail = await getGmailClient(userId);

    // List messages
    const res = await gmail.users.messages.list({
        userId: "me",
        maxResults,
        q: "is:unread label:inbox", // Focus on inbox unread
    });

    const messages = res.data.messages || [];
    const fullMessages = await Promise.all(
        messages.map(async (msg) => {
            const detail = await gmail.users.messages.get({
                userId: "me",
                id: msg.id,
            });
            return detail.data;
        })
    );

    return fullMessages.map(msg => {
        const headers = msg.payload.headers;
        const subject = headers.find(h => h.name === "Subject")?.value || "(No Subject)";
        const from = headers.find(h => h.name === "From")?.value || "Unknown";
        const date = headers.find(h => h.name === "Date")?.value;

        // Extract body (simplified)
        let body = "";
        if (msg.payload.parts) {
            const part = msg.payload.parts.find(p => p.mimeType === "text/plain");
            if (part && part.body.data) {
                body = Buffer.from(part.body.data, "base64").toString("utf-8");
            }
        } else if (msg.payload.body.data) {
            body = Buffer.from(msg.payload.body.data, "base64").toString("utf-8");
        }

        return {
            id: msg.id,
            threadId: msg.threadId,
            subject,
            from,
            date,
            snippet: msg.snippet,
            body: body.substring(0, 2000), // Limit body size for AI processing
        };
    });
}

export async function markEmailsAsRead(userId, messageIds) {
    if (!messageIds || messageIds.length === 0) return;

    const gmail = await getGmailClient(userId);

    await gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
            ids: messageIds,
            removeLabelIds: ["UNREAD"],
        },
    });
}
