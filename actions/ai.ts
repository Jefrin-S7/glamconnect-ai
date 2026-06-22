"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { nvidiaProvider } from "@/lib/ai/nvidia-provider";
import { parseJsonResponse } from "@/lib/ai/json";
import { beautyAssistantSchema } from "@/lib/ai/schemas";
import { computeMatchScore } from "@/lib/recommendation/match-score";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { BeautyAssistantResult, MatchedSalon, Salon, ServiceCategory } from "@/types";

// ─────────────────────────────────────────────────────────────────────
// AI Beauty Assistant
// ─────────────────────────────────────────────────────────────────────

const BEAUTY_SYSTEM_PROMPT = [
  "You are the AI Beauty Assistant inside GlamConnect AI, a beauty salon marketplace for Chennai, India.",
  "Respond with practical, specific suggestions suited to Chennai's climate and salon culture.",
  "Return ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:",
  '{"hairstyles": ["...", "...", "..."], "haircareTip": "...", "services": ["...", "..."], "serviceCategories": ["..."], "area": "..." or null}',
  `"serviceCategories" must only contain values from this exact set: ${SERVICE_CATEGORIES.join(", ")}.`,
  '"services" should be natural-language service names (e.g. "Curly-cut trims"), not the raw category codes.',
  '"area" should be one of the Chennai neighborhoods the user mentions (Anna Nagar, Adyar, Velachery, T Nagar, OMR), or null.',
].join("\n");

const MAX_QUERY_LENGTH = 500;
const MAX_MATCHED_SALONS = 3;

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
    .filter((c): c is NonNullable<typeof c> => c !== null)
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
  if (!trimmed) throw new Error("Tell us a bit about your hair or skin first.");
  if (trimmed.length > MAX_QUERY_LENGTH) {
    throw new Error("That's a lot to take in at once — try a shorter description.");
  }

  let parsed;
  try {
    parsed = await nvidiaProvider.complete({
      systemPrompt: BEAUTY_SYSTEM_PROMPT,
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

// ─────────────────────────────────────────────────────────────────────
// AI Marketing Assistant (salon owner)
// ─────────────────────────────────────────────────────────────────────

export type MarketingContentType =
  | "instagram_caption"
  | "festival_offer"
  | "whatsapp_campaign";

export interface GenerateMarketingCopyInput {
  salonName: string;
  area: string;
  contentType: MarketingContentType;
  serviceName: string;
  discountPercent: number;
  tone: "professional" | "casual" | "festive";
}

const CONTENT_TYPE_LABELS: Record<MarketingContentType, string> = {
  instagram_caption: "Instagram caption",
  festival_offer: "festival promotional offer",
  whatsapp_campaign: "WhatsApp broadcast message",
};

const TONE_GUIDANCE: Record<string, string> = {
  professional: "polished and professional — suitable for a premium salon brand",
  casual:
    "friendly and conversational — feels like a message from a trusted neighbourhood salon",
  festive:
    "warm, celebratory, and energetic — perfect for Pongal, Diwali, or wedding season",
};

function buildMarketingPrompt(input: GenerateMarketingCopyInput): string {
  const label = CONTENT_TYPE_LABELS[input.contentType];
  const toneDesc = TONE_GUIDANCE[input.tone];

  return [
    `You are a professional copywriter for ${input.salonName}, a beauty salon in ${input.area}, Chennai, India.`,
    "",
    `Write a single ${label} with the following brief:`,
    `- Service being promoted: ${input.serviceName}`,
    `- Discount offered: ${input.discountPercent}% off`,
    `- Tone: ${toneDesc}`,
    "",
    "Format-specific requirements:",
    input.contentType === "instagram_caption"
      ? "Include 3-5 relevant emojis woven naturally into the text, end with 8-12 hashtags relevant to Chennai beauty and the service. Keep the caption under 200 words."
      : input.contentType === "festival_offer"
      ? "Make it feel like a limited-time announcement. Include an urgency phrase. Keep it under 100 words — suitable for a WhatsApp status or a story slide."
      : "Write it as a personalised broadcast message (starts with 'Hi [Name]'). Keep it under 80 words, include the discount clearly, and end with a clear call to action (reply YES / click below).",
    "",
    "Output only the final copy — no labels, no explanation, no quotation marks around the whole thing.",
  ].join("\n");
}

export async function generateMarketingCopy(
  input: GenerateMarketingCopyInput
): Promise<string> {
  if (!input.serviceName.trim()) throw new Error("Enter a service name first.");
  if (input.discountPercent < 1 || input.discountPercent > 90) {
    throw new Error("Discount must be between 1% and 90%.");
  }

  const copy = await nvidiaProvider.complete({
    systemPrompt:
      "You are a professional marketing copywriter specialising in Indian beauty and wellness brands. Write only the final copy — no meta-commentary, no quotation marks wrapping the whole response.",
    userPrompt: buildMarketingPrompt(input),
    // Free-form text — identity parse, no schema needed.
    parse: (raw) => raw.trim(),
  });

  if (!copy) throw new Error("The AI returned an empty response — please try again.");
  return copy;
}
