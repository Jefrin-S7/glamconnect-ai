import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider } from "./provider";

// Reads ANTHROPIC_API_KEY from the environment automatically.
const client = new Anthropic();
const MODEL = "claude-sonnet-4-6";

async function requestCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return message.content.map((block) => (block.type === "text" ? block.text : "")).join("");
}

/**
 * The first concrete AIProvider implementation — see lib/ai/provider.ts
 * for why feature code depends on that interface instead of this file
 * directly, which is what keeps the model swappable later.
 */
export const anthropicProvider: AIProvider = {
  async complete({ systemPrompt, userPrompt, parse }) {
    const text = await requestCompletion(systemPrompt, userPrompt);
    try {
      return parse(text);
    } catch {
      // One retry with a stricter instruction before giving up — see "AI
      // Architecture" in the Technical Architecture doc. Generic here
      // rather than per-feature, so every AI feature gets this for free.
      const retryText = await requestCompletion(
        systemPrompt,
        `${userPrompt}\n\nReturn ONLY the raw JSON object — no other text, no markdown fences.`
      );
      return parse(retryText);
    }
  },
};
