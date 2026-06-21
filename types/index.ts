// Shared types — mirrors the trimmed Firestore schema from the 48-Hour
// Buildathon Roadmap (services embedded on the salon document, no
// subcollections, so every read is a single document fetch).

import type { CHENNAI_AREAS, PRICE_TIERS, SERVICE_CATEGORIES } from "@/lib/constants";

export type UserRole = "customer" | "salon_owner" | "admin";

export interface AppUser {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  photoUrl?: string | null;
  createdAt: string; // ISO timestamp
}

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface SalonService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
}

export interface GalleryAccent {
  from: string;
  to: string;
  /** lucide-react icon name, e.g. "Scissors" | "Flower2" | "Gem" */
  icon: string;
}

export interface ReviewSummary {
  strengths: string[];
  weaknesses: string[];
}

export type PriceTier = (typeof PRICE_TIERS)[number];
export type ChennaiArea = (typeof CHENNAI_AREAS)[number];
export type SalonStatus = "pending" | "live" | "rejected" | "needs_info";

export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  category: string[];
  priceTier: PriceTier;
  ratingAvg: number;
  services: SalonService[];
  /** Precomputed once by the seed script — never generated on a live request. */
  reviewSummary?: ReviewSummary;
  galleryAccent: GalleryAccent;
  status: SalonStatus;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  /** Human-readable reference shown to the customer, e.g. "GCA-4F9A2C" — generated once at booking time. */
  reference: string;
  customerId: string;
  salonId: string;
  serviceId: string;
  date: string; // "2026-06-20"
  timeSlot: string; // "14:30"
  /** Denormalized from the service at booking time — captures what was
   * actually booked, and lets slot-overlap checks avoid an extra lookup. */
  durationMinutes: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  salonId: string;
  customerId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface MatchScoreResult {
  score: number; // 0–100
  reasons: string[];
}

export interface MatchedSalon {
  id: string;
  name: string;
  area: string;
  /** The specific service name that triggered this match — shown to explain "why this salon". */
  matchedService: string;
}

export interface BeautyAssistantResult {
  hairstyles: string[];
  haircareTip: string;
  services: string[];
  /** Always real, currently-listed salons — cross-referenced server-side, never the LLM's own invented names. */
  salons: MatchedSalon[];
}
