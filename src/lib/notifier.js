export async function sendSlackNotification(webhookUrl, text) {
    if (!webhookUrl) return { success: false, error: "Missing webhook URL" };

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: "📧 *MailAI Daily Email Summary*\n\n" + text,
        }),
    });

    if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
    }

    return { success: true };
}

export async function sendWhatsAppNotification(phone, text) {
    // Note: Implementing real WhatsApp Business API requires a verified sender account (e.g., via Twilio or Meta).
    // For demonstration, we'll log it and simulate success.
    console.log(`[WhatsApp Simulation] Sending to ${phone}: ${text}`);
    return { success: true, warning: "WhatsApp integration currently operates in simulation mode." };
}

export async function sendTelegramNotification(chatId, text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error("[Notifier] TELEGRAM_BOT_TOKEN is missing");
        return { success: false, error: "Telegram Bot Token not configured" };
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: "📧 *MailAI Daily Email Summary*\n\n" + text,
            parse_mode: "Markdown"
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram notification failed: ${errorData.description || response.statusText}`);
    }

    return { success: true };
}
