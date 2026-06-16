// Shared types — mirrors the trimmed Firestore schema from the 48-Hour
// Buildathon Roadmap (services embedded on the salon document, no
// subcollections, so every read is a single document fetch).

export type UserRole = "customer" | "salon_owner" | "admin";

export interface AppUser {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  photoUrl?: string | null;
  createdAt: string; // ISO timestamp
}

export type ServiceCategory = "hair" | "skin" | "makeup" | "bridal" | "spa";

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

export type PriceTier = "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹";
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
  customerId: string;
  salonId: string;
  serviceId: string;
  date: string; // "2026-06-20"
  timeSlot: string; // "14:30"
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

export interface BeautyAssistantResult {
  hairstyles: string[];
  haircareTip: string;
  services: string[];
  salons: { name: string; area: string }[];
}
