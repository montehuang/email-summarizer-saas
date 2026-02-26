import { google } from "googleapis";
import prisma from "./prisma";

export async function getGmailClient(userId) {
    console.log(`[Gmail] Getting client for user: ${userId}`);
    const account = await prisma.account.findFirst({
        where: { userId, provider: "google" },
    });

    if (!account) {
        console.error(`[Gmail] No google account found for user: ${userId}`);
        throw new Error("Google account not linked");
    }

    if (!account.access_token) {
        console.error(`[Gmail] Access token missing for user: ${userId}`);
        throw new Error("Access token missing");
    }

    console.log(`[Gmail] Tokens found - Access: ${!!account.access_token}, Refresh: ${!!account.refresh_token}`);

    const oauth2Client = new google.auth.OAuth2(
        process.env.AUTH_GOOGLE_ID,
        process.env.AUTH_GOOGLE_SECRET
    );

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    // Handle token expiration and refresh
    oauth2Client.on("tokens", async (tokens) => {
        console.log("[Gmail] Received new tokens from Google");
        const updateData = {};
        if (tokens.access_token) updateData.access_token = tokens.access_token;
        if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token;
        if (tokens.expiry_date) updateData.expires_at = Math.floor(tokens.expiry_date / 1000);

        if (Object.keys(updateData).length > 0) {
            console.log("[Gmail] Updating account tokens in DB...");
            await prisma.account.update({
                where: { id: account.id },
                data: updateData,
            });
            console.log("[Gmail] DB update successful");
        }
    });

    return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function fetchRecentEmails(userId, maxResults = 20) {
    try {
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
    } catch (error) {
        if (error.message.includes("invalid_grant")) {
            console.error("[Gmail] Token invalid (invalid_grant). User Needs to Re-authenticate.");
            throw new Error("你的 Google 授权已过期或失效，请尝试退出登录并重新通过 Google 登录以刷新授权。");
        }
        throw error;
    }
}

export async function markEmailsAsRead(userId, messageIds) {
    if (!messageIds || messageIds.length === 0) return;

    try {
        const gmail = await getGmailClient(userId);

        await gmail.users.messages.batchModify({
            userId: "me",
            requestBody: {
                ids: messageIds,
                removeLabelIds: ["UNREAD"],
            },
        });
    } catch (error) {
        if (error.message.includes("invalid_grant")) {
            console.error("[Gmail] Token invalid (invalid_grant) during markAsRead.");
            throw new Error("授权失效，无法标记邮件为已读。请重新登录。");
        }
        throw error;
    }
}
