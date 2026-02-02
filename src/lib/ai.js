import { getAiSummary } from "./ai/factory";

export async function summarizeEmails(emails, language = "zh", userPrefs = null) {
    if (!emails || emails.length === 0) return "No unread emails found.";
    return await getAiSummary(emails, language, userPrefs);
}
