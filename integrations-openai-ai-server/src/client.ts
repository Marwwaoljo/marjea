import OpenAI from "openai";

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
}

// Lazily construct: an unused semantic feature must never break Phase 1 startup.
// No personal-key fallback and no SDK-level retries (the engine owns the budget).
export function createOpenAIClient(): OpenAI {
  if (!isOpenAIConfigured()) {
    throw new Error("MARJEA_OPENAI_NOT_CONFIGURED");
  }
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    maxRetries: 0,
    timeout: 30_000,
  });
}