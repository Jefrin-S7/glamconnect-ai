"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { computeMatchScore } from "@/lib/recommendation/match-score";
import type { Salon, PriceTier } from "@/types";

export interface SearchSalonsInput {
  /** Free-text area from the search bar, substring-matched. */
  areaQuery?: string;
  /** Free-text service from the search bar, matched against service names/categories and salon tags. */
  serviceQuery?: string;
  /** Exact area from the filter bar's dropdown — hard filter. */
  areaFilter?: string;
  /** Toggled-on price tiers from the filter bar — hard filter; empty/omitted means no price filter. */
  priceTiers?: PriceTier[];
}

export interface SalonSearchResult extends Salon {
  matchScore: number;
  matchReasons: string[];
}

export async function searchSalons(input: SearchSalonsInput = {}): Promise<SalonSearchResult[]> {
  const db = getAdminDb();

  // Only a dozen or so salons exist at this stage, so one cheap collection
  // read plus in-memory filtering is simpler and more flexible than
  // building Firestore composite indexes for substring search. Algolia or
  // Typesense is the documented upgrade path once listing volume grows
  // (see "Salon Discovery" in the Technical Architecture doc).
  const snapshot = await db.collection("salons").where("status", "==", "live").get();
  const salons = snapshot.docs.map((doc) => doc.data() as Salon);

  const areaQuery = input.areaQuery?.trim().toLowerCase() || undefined;
  const serviceQuery = input.serviceQuery?.trim().toLowerCase() || undefined;
  const areaFilter = input.areaFilter?.trim() || undefined;
  const priceTiers = input.priceTiers ?? [];

  const filtered = salons.filter((salon) => {
    if (areaFilter && salon.area !== areaFilter) return false;
    if (areaQuery && !salon.area.toLowerCase().includes(areaQuery)) return false;
    if (priceTiers.length > 0 && !priceTiers.includes(salon.priceTier)) return false;

    if (serviceQuery) {
      const haystack = [...salon.category, ...salon.services.flatMap((s) => [s.name, s.category])]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(serviceQuery)) return false;
    }

    return true;
  });

  // Hard filters (areaFilter, priceTiers) already guarantee every surviving
  // salon matches them, so they're not passed into the score below — doing
  // so would just inflate every result uniformly rather than rank them.
  // The free-text search fields, and a price preference only when exactly
  // one tier is toggled (otherwise there's no single clear preference),
  // are the signals actually worth ranking by here.
  return filtered
    .map((salon) => {
      const { score, reasons } = computeMatchScore(salon, {
        areaQuery: areaQuery || areaFilter,
        serviceQuery,
        preferredPriceTier: priceTiers.length === 1 ? priceTiers[0] : undefined,
      });
      return { ...salon, matchScore: score, matchReasons: reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
