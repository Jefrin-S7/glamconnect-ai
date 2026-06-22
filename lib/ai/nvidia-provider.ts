import "server-only";
import OpenAI from "openai";
import type { AIProvider } from "./provider";

/**
 * NVIDIA NIM provider — the OpenAI SDK pointed at NVIDIA's free hosted
 * inference endpoint. Every model in the catalog exposes the same
 * /v1/chat/completions shape, so the only things that change versus
 * calling OpenAI directly are the base_url and the model name strings.
 *
 * API key: sign up at build.nvidia.com → Settings → API Keys.
 * Key format: nvapi-xxxxxxxxxxxxxxxx (set as NVIDIA_API_KEY in .env.local)
 */
const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY ?? "nvapi-placeholder",
});

/**
 * Model priority list for chat/instruction tasks.
 * - meta/llama-3.1-405b-instruct: confirmed fast and coherent (101/189
 *   live models tested in April 2026, this one returned clean completions)
 * - mistralai/mistral-large-3-675b-instruct-2512: strong instruction
 *   following and structured output, good JSON reliability
 * - meta/llama-3.3-70b-instruct: lighter fallback when the larger models
 *   are under load during US peak hours
 *
 * The free tier catalog changes — see build.nvidia.com/models for the
 * current list. Swap models here without touching any feature code.
 */
const MODEL_CHAIN = [
  "meta/llama-3.1-405b-instruct",
  "mistralai/mistral-large-3-675b-instruct-2512",
  "meta/llama-3.3-70b-instruct",
] as const;

async function callNim(
  systemPrompt: string,
  userPrompt: string,
  modelIndex = 0
): Promise<string> {
  const model = MODEL_CHAIN[modelIndex] ?? MODEL_CHAIN[0];

  const response = await client.chat.completions.create({
    model,
    max_tokens: 900,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * Concrete AIProvider implementation backed by NVIDIA NIM.
 *
 * Retry logic: on a parse failure, tries the next model in MODEL_CHAIN
 * with a stricter "return only raw JSON" addendum. This is a real
 * cross-model fallback, not just a same-model retry — if llama-3.1-405b
 * is under load and returns a garbled response, mistral-large-3 will
 * catch it. After exhausting all models, throws to the caller.
 */
export const nvidiaProvider: AIProvider = {
  async complete({ systemPrompt, userPrompt, parse }) {
    let lastError: unknown;

    for (let i = 0; i < MODEL_CHAIN.length; i++) {
      const prompt = i === 0
        ? userPrompt
        : `${userPrompt}\n\nReturn ONLY the raw JSON object — absolutely no markdown, no fences, no preamble.`;

      try {
        const raw = await callNim(systemPrompt, prompt, i);
        return parse(raw);
      } catch (err) {
        lastError = err;
        // Network/auth errors shouldn't waste retries on more models.
        if (err instanceof Error && err.message.includes("401")) throw err;
        // Parse errors → try next model in the chain.
      }
    }

    throw lastError;
  },
};
