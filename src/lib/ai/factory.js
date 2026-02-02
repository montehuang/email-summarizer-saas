import { summarizeWithGemini } from "./providers/gemini";
import { summarizeWithOpenAI } from "./providers/openai";

export async function getAiSummary(emails, language, userPrefs) {
    // 1. Determine Provider and Config
    let provider = process.env.SYSTEM_AI_PROVIDER || "gemini";
    let config = {
        provider,
        model: process.env.AI_MODEL,
        apiKey: null
    };

    // 2. Override with User Custom Settings if enabled
    if (userPrefs?.useCustomAI && userPrefs.customAiProvider) {
        console.log(`[AI Factory] Using custom provider: ${userPrefs.customAiProvider}`);
        config = {
            provider: userPrefs.customAiProvider,
            model: userPrefs.customAiModel,
            apiKey: userPrefs.customAiApiKey
        };
    } else {
        console.log(`[AI Factory] Using system default provider: ${provider}`);
    }

    // 3. Route to specific provider
    switch (config.provider) {
        case "gemini":
            return await summarizeWithGemini(emails, language, config);
        case "openai":
        case "deepseek":
            return await summarizeWithOpenAI(emails, language, config);
        default:
            throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
}
