export async function summarizeWithOpenAI(emails, language, config) {
    const apiKey = config.apiKey || (config.provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.DEEPSEEK_API_KEY);
    const baseURL = config.provider === 'deepseek'
        ? "https://api.deepseek.com/v1"
        : (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1");

    const modelName = config.model || (config.provider === 'openai' ? "gpt-4o-mini" : "deepseek-chat");

    if (!apiKey) throw new Error(`${config.provider.toUpperCase()} API Key is missing`);

    const prompt = `
    You are an AI email assistant. Summarize the following unread work emails.
    Format the summary as a structured report with:
    1. A high-level overview of the day's priorities.
    2. A list of key action items or requests for each important email.
    3. Mention the sender and subject for each entry.

    Language: ${language === "zh" ? "Chinese (Simplified)" : "English"}

    Emails:
    ${emails.map((email, index) => `
    [Email ${index + 1}]
    From: ${email.from}
    Subject: ${email.subject}
    Body: ${email.body}
    `).join("\n---\n")}
    `;

    const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: [
                { role: "system", content: "You are a helpful assistant that summarizes emails." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`${config.provider.toUpperCase()} API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
