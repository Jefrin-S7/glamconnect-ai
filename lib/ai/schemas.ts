import { z } from "zod";
import { CHENNAI_AREAS, SERVICE_CATEGORIES } from "@/lib/constants";

/**
 * Every AI feature validates its LLM output against a schema like this one
 * before it's ever trusted — see "AI Architecture" in the Technical
 * Architecture doc. serviceCategories and area are constrained to the
 * platform's own controlled vocabularies (lib/constants.ts) specifically
 * so the result can be safely cross-referenced against real Firestore
 * data afterward, not just displayed as-is.
 */
export const beautyAssistantSchema = z.object({
  hairstyles: z.array(z.string()).min(1).max(6),
  haircareTip: z.string().min(1),
  /** Natural-language service names for display — not the matching key. */
  services: z.array(z.string()).min(1).max(6),
  /** The actual matching key used to cross-reference real salons. */
  serviceCategories: z.array(z.enum(SERVICE_CATEGORIES)).default([]),
  area: z.enum(CHENNAI_AREAS).nullable().default(null),
});

export type BeautyAssistantLLMOutput = z.infer<typeof beautyAssistantSchema>;
