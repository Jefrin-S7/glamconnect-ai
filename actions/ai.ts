"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { anthropicProvider } from "@/lib/ai/anthropic-provider";
import { parseJsonResponse } from "@/lib/ai/json";
import { beautyAssistantSchema } from "@/lib/ai/schemas";
import { computeMatchScore } from "@/lib/recommendation/match-score";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { BeautyAssistantResult, MatchedSalon, Salon, ServiceCategory } from "@/types";

const SYSTEM_PROMPT = [
  "You are the AI Beauty Assistant inside GlamConnect AI, a beauty salon marketplace for Chennai, India.",
  "Respond with practical, specific suggestions suited to Chennai's climate and salon culture.",
  "Return ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:",
  '{"hairstyles": ["...", "...", "..."], "haircareTip": "...", "services": ["...", "..."], "serviceCategories": ["..."], "area": "..." or null}',
  `"serviceCategories" must only contain values from this exact set: ${SERVICE_CATEGORIES.join(", ")}.`,
  '"services" should be natural-language service names (e.g. "Curly-cut trims"), not the raw category codes.',
  "\"area\" should be one of the Chennai neighborhoods the user mentions, or null if they didn't mention one.",
].join("\n");

const MAX_QUERY_LENGTH = 500;
const MAX_MATCHED_SALONS = 3;

/**
 * Cross-references the model's suggested service categories (and optional
 * area) against the live salons collection, so the assistant only ever
 * recommends real, currently-listed salons — never names the model itself
 * proposed. Reuses computeMatchScore (the same pure ranking function
 * /discover uses) rather than a second, parallel ranking implementation.
 */
async function findMatchingSalons(
  categories: ServiceCategory[],
  area: string | null
): Promise<MatchedSalon[]> {
  if (categories.length === 0) return [];

  const db = getAdminDb();
  const snapshot = await db.collection("salons").where("status", "==", "live").get();
  const salons = snapshot.docs.map((doc) => doc.data() as Salon);
  const categorySet = new Set(categories);

  return salons
    .map((salon) => {
      const matchedService = salon.services.find((s) => categorySet.has(s.category));
      if (!matchedService) return null;

      const { score } = computeMatchScore(salon, {
        areaQuery: area ?? undefined,
        serviceQuery: matchedService.category,
      });

      return { salon, matchedService, score };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHED_SALONS)
    .map(({ salon, matchedService }) => ({
      id: salon.id,
      name: salon.name,
      area: salon.area,
      matchedService: matchedService.name,
    }));
}

export async function askBeautyAssistant(query: string): Promise<BeautyAssistantResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Tell us a bit about your hair or skin first.");
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    throw new Error("That's a lot to take in at once — try a shorter description.");
  }

  let parsed;
  try {
    parsed = await anthropicProvider.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `A user describes themselves as: "${trimmed}"`,
      parse: (raw) => beautyAssistantSchema.parse(parseJsonResponse(raw)),
    });
  } catch {
    throw new Error("Couldn't reach the AI assistant just now — please try again in a moment.");
  }

  const salons = await findMatchingSalons(parsed.serviceCategories, parsed.area);

  return {
    hairstyles: parsed.hairstyles,
    haircareTip: parsed.haircareTip,
    services: parsed.services,
    salons,
  };
}
