import type { MatchScoreResult, PriceTier } from "@/types";

/**
 * The subset of a salon's data the match score actually needs. Deliberately
 * narrower than the full Salon type so this function stays a pure,
 * dependency-free utility — no Firestore types leaking in here.
 */
export interface MatchScoreSalonInput {
  ratingAvg: number;
  priceTier: PriceTier;
  area: string;
  services: { name: string; category: string }[];
}

/**
 * Signals to score against. Every field is optional — a pure function
 * should never invent a distance, budget, or preference it wasn't given.
 * Real geolocation/booking-history signals slot in here later without
 * changing the shape of what's already passed.
 */
export interface MatchScoreContext {
  preferredPriceTier?: PriceTier;
  areaQuery?: string;
  serviceQuery?: string;
}

const PRICE_TIER_RANK: Record<PriceTier, number> = { "₹": 1, "₹₹": 2, "₹₹₹": 3, "₹₹₹₹": 4 };

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Computes a 0-100 match score plus the human-readable reasons behind it.
 * Rating always contributes (it's the one signal every salon has); the
 * remaining weight is split only across whichever optional context fields
 * are actually supplied, so a partial query still produces an honest score
 * instead of one padded out with assumed data.
 */
export function computeMatchScore(
  salon: MatchScoreSalonInput,
  context: MatchScoreContext = {}
): MatchScoreResult {
  const reasons: string[] = [];
  const signals: { weight: number; value: number }[] = [
    { weight: 0.45, value: clamp01(salon.ratingAvg / 5) },
  ];

  if (salon.ratingAvg >= 4.5) {
    reasons.push(`Rated ${salon.ratingAvg.toFixed(1)}★ by past customers`);
  }

  if (context.preferredPriceTier) {
    const rankDistance = Math.abs(
      PRICE_TIER_RANK[salon.priceTier] - PRICE_TIER_RANK[context.preferredPriceTier]
    );
    const priceFit = clamp01(1 - rankDistance / 3);
    signals.push({ weight: 0.25, value: priceFit });
    if (rankDistance === 0) reasons.push(`Matches your ${salon.priceTier} budget`);
  }

  if (context.areaQuery?.trim()) {
    const query = context.areaQuery.trim().toLowerCase();
    const areaFit = salon.area.toLowerCase().includes(query) ? 1 : 0;
    signals.push({ weight: 0.15, value: areaFit });
    if (areaFit === 1) reasons.push(`Located in ${salon.area}`);
  }

  if (context.serviceQuery?.trim()) {
    const query = context.serviceQuery.trim().toLowerCase();
    const matchedService = salon.services.find(
      (s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)
    );
    signals.push({ weight: 0.15, value: matchedService ? 1 : 0 });
    if (matchedService) reasons.push(`Offers ${matchedService.name}`);
  }

  if (reasons.length === 0) {
    reasons.push(`Rated ${salon.ratingAvg.toFixed(1)}★ overall`);
  }

  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0);
  const weighted = signals.reduce((sum, s) => sum + s.weight * s.value, 0);
  const score = Math.round(clamp01(weighted / totalWeight) * 100);

  return { score, reasons };
}
