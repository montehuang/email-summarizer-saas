import { GoogleGenerativeAI } from "@google/generative-ai";

export async function summarizeWithGemini(emails, language, config) {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    const modelName = config.model || process.env.AI_MODEL || "gemini-1.5-flash";

    if (!apiKey) throw new Error("Gemini API Key is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
