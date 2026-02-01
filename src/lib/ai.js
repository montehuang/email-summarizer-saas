import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function summarizeEmails(emails, language = "zh") {
    if (!emails || emails.length === 0) return "No unread emails found.";

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
