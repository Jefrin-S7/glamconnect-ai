/**
 * Single source of truth for the platform's controlled vocabularies.
 * Plain `as const` tuples with no imports, so this is safely importable
 * from both client and server code, and from types/index.ts (which
 * derives ServiceCategory/PriceTier from these) without creating a
 * circular dependency.
 */

export const CHENNAI_AREAS = ["Anna Nagar", "Adyar", "Velachery", "T Nagar", "OMR"] as const;

export const PRICE_TIERS = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"] as const;

export const SERVICE_CATEGORIES = ["hair", "skin", "makeup", "bridal", "spa"] as const;
