/**
 * Every AI feature (Beauty Assistant, Match Score explanation, Review
 * Summary, Trend Discovery, Marketing Assistant) calls through this
 * interface instead of an OpenAI/Gemini SDK directly, so the underlying
 * model can be swapped — or A/B tested — without touching feature code.
 *
 * Implemented in Claude Code Prompt 7 (AI Beauty Assistant) and reused
 * by Prompt 8 (Marketing Assistant).
 */
export interface AIProvider {
  complete<T>(input: {
    systemPrompt: string;
    userPrompt: string;
    /** Parses + validates the raw model output into a typed result. */
    parse: (raw: string) => T;
  }): Promise<T>;
}
