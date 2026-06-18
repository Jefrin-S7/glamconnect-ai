/**
 * One-off seed script.
 *
 * Populates Firestore with realistic demo data — 12 salons across Anna
 * Nagar, Adyar, Velachery, T Nagar, and OMR, each with embedded services
 * and a gradient accent matching the icon set from GlamConnectLanding.jsx,
 * plus ~28 reviews spread across them. After the base data is written, it
 * calls the Anthropic API once per salon to generate a reviewSummary
 * {strengths[], weaknesses[]} from that salon's reviews and writes it onto
 * the salon document.
 *
 * This runs once, by hand — never on a live request (see "AI Architecture"
 * in the Technical Architecture doc for why review summaries are
 * precomputed instead of generated on page load).
 *
 * Usage:
 *   npm run seed
 *   (equivalent to: npx tsx scripts/seed.ts)
 *
 * Requires .env.local with FIREBASE_ADMIN_* and ANTHROPIC_API_KEY set
 * (see .env.example). Safe to re-run — every salon, review, and seed user
 * uses a deterministic ID, so re-running overwrites the same documents
 * instead of creating duplicates.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
// Imports admin-core.ts directly, not admin.ts — that file's `server-only`
// guard throws unconditionally outside Next's bundler, which would break
// this script the moment it's run via tsx. See admin.ts for why.
import { getAdminDb } from "../lib/firebase/admin-core";
import type { Salon, SalonService, GalleryAccent, Review, ReviewSummary } from "../types";

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  "Anna Nagar": { lat: 13.085, lng: 80.2101 },
  Adyar: { lat: 13.0012, lng: 80.2565 },
  Velachery: { lat: 12.9756, lng: 80.2207 },
  "T Nagar": { lat: 13.0418, lng: 80.2341 },
  OMR: { lat: 12.9698, lng: 80.2422 },
};

/** Spreads salons within the same area out by roughly ±1km instead of
 * stacking them on one exact point. */
function jitter(value: number): number {
  return value + (Math.random() - 0.5) * 0.018;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const svc = (
  id: string,
  name: string,
  price: number,
  durationMinutes: number,
  category: SalonService["category"]
): SalonService => ({ id, name, price, durationMinutes, category });

// ---------------------------------------------------------------------
// Salons — 12 across the 5 target areas, 3 each in Anna Nagar/Adyar and
// 2 each in T Nagar/Velachery/OMR.
// ---------------------------------------------------------------------

interface SeedSalon {
  id: string;
  name: string;
  area: keyof typeof AREA_COORDS;
  category: string[];
  priceTier: Salon["priceTier"];
  services: SalonService[];
  galleryAccent: GalleryAccent;
}

const SALONS: SeedSalon[] = [
  {
    id: "salon-01",
    name: "Jasmine & Jade Studio",
    area: "Anna Nagar",
    category: ["bridal", "unisex"],
    priceTier: "₹₹₹",
    services: [
      svc("s01-1", "Bridal Jadai with Fresh Jasmine", 3500, 90, "bridal"),
      svc("s01-2", "Bridal Makeup (HD)", 12000, 120, "bridal"),
      svc("s01-3", "Pre-Bridal Skin Glow Package", 4500, 75, "skin"),
      svc("s01-4", "Hair Spa & Smoothening", 2200, 60, "hair"),
    ],
    galleryAccent: { from: "#7C3AED", to: "#C084FC", icon: "Flower2" },
  },
  {
    id: "salon-02",
    name: "Curl & Co. Studio",
    area: "Anna Nagar",
    category: ["hair", "unisex"],
    priceTier: "₹₹",
    services: [
      svc("s02-1", "Curl-Pattern Haircut", 900, 45, "hair"),
      svc("s02-2", "Curtain Bangs for Curly Hair", 700, 30, "hair"),
      svc("s02-3", "Deep Conditioning Curl Treatment", 1400, 50, "hair"),
      svc("s02-4", "Keratin Smoothening", 3200, 120, "hair"),
    ],
    galleryAccent: { from: "#6D28D9", to: "#A78BFA", icon: "Scissors" },
  },
  {
    id: "salon-03",
    name: "Pure Glow Skin Clinic",
    area: "Anna Nagar",
    category: ["skin", "women"],
    priceTier: "₹₹",
    services: [
      svc("s03-1", "Glass Skin Facial", 1800, 60, "skin"),
      svc("s03-2", "Acne Clear Therapy", 1500, 45, "skin"),
      svc("s03-3", "De-Tan Pack", 800, 30, "skin"),
    ],
    galleryAccent: { from: "#5B21B6", to: "#C4B5FD", icon: "Sparkles" },
  },
  {
    id: "salon-04",
    name: "The Glow Room",
    area: "Adyar",
    category: ["skin", "women"],
    priceTier: "₹₹",
    services: [
      svc("s04-1", "Hydrafacial", 2500, 60, "skin"),
      svc("s04-2", "Classic Clean-Up", 600, 30, "skin"),
      svc("s04-3", "Festive Smoky Eye Makeup", 2000, 45, "makeup"),
      svc("s04-4", "Eyebrow & Lash Tint", 500, 20, "makeup"),
    ],
    galleryAccent: { from: "#6D28D9", to: "#A78BFA", icon: "Sparkles" },
  },
  {
    id: "salon-05",
    name: "Salt & Strand Spa",
    area: "Adyar",
    category: ["spa", "home-service"],
    priceTier: "₹₹₹",
    services: [
      svc("s05-1", "Full Body Swedish Massage", 3000, 75, "spa"),
      svc("s05-2", "Foot Reflexology", 1200, 40, "spa"),
      svc("s05-3", "Aromatherapy Spa Package", 3800, 90, "spa"),
    ],
    galleryAccent: { from: "#4C1D95", to: "#C4B5FD", icon: "Flower2" },
  },
  {
    id: "salon-06",
    name: "Vogue Edge Unisex Salon",
    area: "Adyar",
    category: ["hair", "unisex"],
    priceTier: "₹₹₹",
    services: [
      svc("s06-1", "Balayage for Indian Hair Tones", 4500, 150, "hair"),
      svc("s06-2", "Trendy Layer Cut", 1100, 45, "hair"),
      svc("s06-3", "Beard Sculpting", 500, 25, "hair"),
      svc("s06-4", "Party Makeup", 2500, 60, "makeup"),
    ],
    galleryAccent: { from: "#7C3AED", to: "#D8B4FE", icon: "Scissors" },
  },
  {
    id: "salon-07",
    name: "Clip & Co. Unisex",
    area: "Velachery",
    category: ["hair", "men", "walk-ins"],
    priceTier: "₹₹",
    services: [
      svc("s07-1", "Men's Haircut", 350, 30, "hair"),
      svc("s07-2", "Women's Haircut", 600, 40, "hair"),
      svc("s07-3", "Beard Trim & Shape", 250, 15, "hair"),
      svc("s07-4", "Hair Color (Global)", 1800, 90, "hair"),
    ],
    galleryAccent: { from: "#5B21B6", to: "#8B5CF6", icon: "Scissors" },
  },
  {
    id: "salon-08",
    name: "Quick Trim Express",
    area: "Velachery",
    category: ["hair", "budget"],
    priceTier: "₹",
    services: [
      svc("s08-1", "Express Haircut", 200, 20, "hair"),
      svc("s08-2", "Quick Beard Trim", 150, 10, "hair"),
      svc("s08-3", "Head Massage", 300, 20, "spa"),
    ],
    galleryAccent: { from: "#4C1D95", to: "#9061F9", icon: "Scissors" },
  },
  {
    id: "salon-09",
    name: "Silk Route Bridal Studio",
    area: "T Nagar",
    category: ["bridal", "by-appointment"],
    priceTier: "₹₹₹₹",
    services: [
      svc("s09-1", "Signature Bridal Look", 25000, 180, "bridal"),
      svc("s09-2", "Engagement Makeup", 9000, 90, "bridal"),
      svc("s09-3", "Reception Hairstyling", 4000, 60, "bridal"),
      svc("s09-4", "Pre-Wedding Skin Prep (3-session)", 8000, 180, "skin"),
    ],
    galleryAccent: { from: "#7C3AED", to: "#D8B4FE", icon: "Gem" },
  },
  {
    id: "salon-10",
    name: "Heritage Bridal Couture Studio",
    area: "T Nagar",
    category: ["bridal"],
    priceTier: "₹₹₹",
    services: [
      svc("s10-1", "Traditional Tamil Bridal Makeup", 15000, 150, "bridal"),
      svc("s10-2", "Kanjivaram-Ready Draping & Hair", 3500, 60, "bridal"),
      svc("s10-3", "Mehendi-Day Makeup", 4000, 60, "makeup"),
    ],
    galleryAccent: { from: "#6D28D9", to: "#C084FC", icon: "Gem" },
  },
  {
    id: "salon-11",
    name: "Urban Snip Barber Co.",
    area: "OMR",
    category: ["men", "home-service"],
    priceTier: "₹",
    services: [
      svc("s11-1", "Classic Men's Haircut", 300, 30, "hair"),
      svc("s11-2", "Hot Towel Shave", 350, 25, "hair"),
      svc("s11-3", "Home-Service Haircut", 500, 30, "hair"),
      svc("s11-4", "Beard Color", 600, 30, "hair"),
    ],
    galleryAccent: { from: "#4C1D95", to: "#9061F9", icon: "Scissors" },
  },
  {
    id: "salon-12",
    name: "Tech Park Touch-Up Salon",
    area: "OMR",
    category: ["unisex", "quick-service"],
    priceTier: "₹₹",
    services: [
      svc("s12-1", "Lunch-Break Haircut (30 min)", 400, 30, "hair"),
      svc("s12-2", "Express Facial Refresh", 700, 25, "skin"),
      svc("s12-3", "Office-Ready Blowout", 600, 30, "hair"),
    ],
    galleryAccent: { from: "#5B21B6", to: "#A78BFA", icon: "Sparkles" },
  },
];

// ---------------------------------------------------------------------
// Reviews — 28 total, spread 2-3 per salon.
// ---------------------------------------------------------------------

interface SeedReview {
  id: string;
  salonId: string;
  rating: number;
  reviewerName: string;
  text: string;
}

const REVIEWS: SeedReview[] = [
  // salon-01 — Jasmine & Jade Studio
  { id: "review-01", salonId: "salon-01", rating: 5, reviewerName: "Divya R.", text: "My bridal trial was exactly what I asked for, and they used real jasmine for my jadai, not fake flowers. Worth every rupee." },
  { id: "review-02", salonId: "salon-01", rating: 4, reviewerName: "Karthik S.", text: "Booked for my sister's engagement makeup, turned out lovely. Only issue was we waited almost 40 minutes past our slot on a Saturday." },
  { id: "review-03", salonId: "salon-01", rating: 5, reviewerName: "Meera V.", text: "The hair spa treatment left my hair so soft. Staff explained every product they were using, felt very professional." },
  // salon-02 — Curl & Co. Studio
  { id: "review-04", salonId: "salon-02", rating: 5, reviewerName: "Ananya K.", text: "Finally a salon that actually understands curly hair instead of just cutting it like straight hair. The curtain bangs came out perfect." },
  { id: "review-05", salonId: "salon-02", rating: 4, reviewerName: "Rahul N.", text: "Good cut, friendly stylist, but the place is tiny and gets crowded by evening." },
  // salon-03 — Pure Glow Skin Clinic
  { id: "review-06", salonId: "salon-03", rating: 5, reviewerName: "Priya M.", text: "The glass skin facial is addictive, my skin glowed for days after. Clean setup too." },
  { id: "review-07", salonId: "salon-03", rating: 3, reviewerName: "Sandhya T.", text: "Results were fine but they tried to upsell me three different add-on packages during the session." },
  // salon-04 — The Glow Room
  { id: "review-08", salonId: "salon-04", rating: 5, reviewerName: "Lakshmi N.", text: "I've been coming here for two years, the hydrafacial is consistently good and the staff remembers my skin concerns." },
  { id: "review-09", salonId: "salon-04", rating: 4, reviewerName: "Vidya P.", text: "Great festive makeup for Diwali, lasted the whole evening. Booking on weekends needs patience though." },
  { id: "review-10", salonId: "salon-04", rating: 5, reviewerName: "Arjun K.", text: "Booked a quick haircut between meetings and they were right on time. Clean, professional, no fuss." },
  // salon-05 — Salt & Strand Spa
  { id: "review-11", salonId: "salon-05", rating: 5, reviewerName: "Deepa S.", text: "The Swedish massage was exactly what I needed after a stressful month. Quiet, calming space." },
  { id: "review-12", salonId: "salon-05", rating: 4, reviewerName: "Ramesh G.", text: "Reflexology was relaxing, though the room was a bit cold for my liking." },
  // salon-06 — Vogue Edge Unisex Salon
  { id: "review-13", salonId: "salon-06", rating: 5, reviewerName: "Aishwarya R.", text: "My balayage came out exactly like the reference photo I showed them. Rare to get that level of precision in Chennai." },
  { id: "review-14", salonId: "salon-06", rating: 4, reviewerName: "Naveen K.", text: "Solid haircut and beard work, slightly pricier than other unisex salons nearby." },
  // salon-07 — Clip & Co. Unisex
  { id: "review-15", salonId: "salon-07", rating: 5, reviewerName: "Suresh B.", text: "Walked in without an appointment on a weekday and was seated in five minutes. Clean cut every time." },
  { id: "review-16", salonId: "salon-07", rating: 4, reviewerName: "Meena R.", text: "Good for a quick affordable haircut near campus, nothing fancy but reliable." },
  { id: "review-17", salonId: "salon-07", rating: 3, reviewerName: "Vignesh P.", text: "Decent haircut but weekend wait times can stretch past 45 minutes." },
  // salon-08 — Quick Trim Express
  { id: "review-18", salonId: "salon-08", rating: 4, reviewerName: "Mohan D.", text: "Exactly what the name promises, in and out in 20 minutes. Good for a quick weekday trim." },
  { id: "review-19", salonId: "salon-08", rating: 4, reviewerName: "Saravanan K.", text: "No-frills but gets the job done fast, good value for the price." },
  // salon-09 — Silk Route Bridal Studio
  { id: "review-20", salonId: "salon-09", rating: 5, reviewerName: "Nithya V.", text: "Our wedding photos look incredible because of how detailed the bridal team was. Worth the higher price for a once-in-a-lifetime day." },
  { id: "review-21", salonId: "salon-09", rating: 5, reviewerName: "Kavya S.", text: "The pre-wedding skin sessions made a real difference, my skin looked completely different by the wedding day." },
  { id: "review-22", salonId: "salon-09", rating: 4, reviewerName: "Harini M.", text: "Beautiful work but you need to book months in advance during wedding season." },
  // salon-10 — Heritage Bridal Couture Studio
  { id: "review-23", salonId: "salon-10", rating: 5, reviewerName: "Revathi K.", text: "They understood exactly how to drape a Kanjivaram for the ceremony, very traditional and elegant." },
  { id: "review-24", salonId: "salon-10", rating: 4, reviewerName: "Bhavani R.", text: "Lovely traditional makeup, though the studio could use better lighting in the waiting area." },
  // salon-11 — Urban Snip Barber Co.
  { id: "review-25", salonId: "salon-11", rating: 5, reviewerName: "Dinesh A.", text: "Home-service haircut saved me an entire Sunday. Barber arrived on time with all his own equipment." },
  { id: "review-26", salonId: "salon-11", rating: 4, reviewerName: "Vikram T.", text: "Good haircut and hot towel shave, would be five stars if home-service slots were easier to book." },
  // salon-12 — Tech Park Touch-Up Salon
  { id: "review-27", salonId: "salon-12", rating: 4, reviewerName: "Swathi J.", text: "Perfect for a lunch-break trim when you work in the tech park, fast and professional." },
  { id: "review-28", salonId: "salon-12", rating: 4, reviewerName: "Pradeep S.", text: "Quick facial refresh before a client meeting, did exactly what it promised." },
];

// ---------------------------------------------------------------------
// AI review summary — one Anthropic call per salon, run once here.
// ---------------------------------------------------------------------

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

async function generateReviewSummary(
  salonName: string,
  area: string,
  reviews: SeedReview[]
): Promise<ReviewSummary | null> {
  if (reviews.length === 0) return null;

  const reviewLines = reviews.map((r) => `- (${r.rating}/5) ${r.text}`).join("\n");

  const prompt = [
    `Here are ${reviews.length} customer reviews for "${salonName}", a salon in ${area}, Chennai:`,
    reviewLines,
    "",
    "Summarize these into a balanced review summary. Return ONLY valid JSON, no markdown fences, no commentary, in exactly this shape:",
    '{"strengths": ["...", "..."], "weaknesses": ["...", "..."]}',
    "2-4 short phrases each, grounded only in what these reviews actually say — do not invent details that aren't present above. If the reviews don't clearly support any weaknesses, return an empty weaknesses array rather than inventing one.",
  ].join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content.map((block) => (block.type === "text" ? block.text : "")).join("");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed.strengths) || !Array.isArray(parsed.weaknesses)) {
    throw new Error("Model returned an unexpected shape");
  }

  return { strengths: parsed.strengths, weaknesses: parsed.weaknesses };
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY — set it in .env.local before running the seed script.");
  }

  const db = getAdminDb();
  const now = new Date().toISOString();

  // Group reviews by salon, and collect one seed "user" doc per unique
  // reviewer name so customerId -> name joins resolve correctly later.
  const reviewsBySalon = new Map<string, SeedReview[]>();
  const seedCustomers = new Map<string, string>(); // name -> customerId

  for (const review of REVIEWS) {
    const list = reviewsBySalon.get(review.salonId) ?? [];
    list.push(review);
    reviewsBySalon.set(review.salonId, list);

    if (!seedCustomers.has(review.reviewerName)) {
      seedCustomers.set(review.reviewerName, `seed-${slugify(review.reviewerName)}`);
    }
  }

  console.log(
    `Seeding ${SALONS.length} salons, ${REVIEWS.length} reviews, and ${seedCustomers.size} seed customers...`
  );

  const batch = db.batch();

  // Salons — base fields only; reviewSummary is added by the AI step below
  // once the batch (and therefore each salon's reviews) has committed.
  for (const s of SALONS) {
    const salonReviews = reviewsBySalon.get(s.id) ?? [];
    const ratingAvg = salonReviews.length
      ? Math.round((salonReviews.reduce((sum, r) => sum + r.rating, 0) / salonReviews.length) * 10) / 10
      : 0;

    const doc: Omit<Salon, "reviewSummary"> = {
      id: s.id,
      ownerId: `seed-owner-${s.id}`,
      name: s.name,
      area: s.area,
      lat: jitter(AREA_COORDS[s.area].lat),
      lng: jitter(AREA_COORDS[s.area].lng),
      category: s.category,
      priceTier: s.priceTier,
      ratingAvg,
      services: s.services,
      galleryAccent: s.galleryAccent,
      status: "live",
    };

    batch.set(db.collection("salons").doc(s.id), doc);
  }

  // Reviews
  for (const r of REVIEWS) {
    const customerId = seedCustomers.get(r.reviewerName)!;
    const doc: Review = {
      id: r.id,
      salonId: r.salonId,
      customerId,
      rating: r.rating,
      text: r.text,
      createdAt: now,
    };
    batch.set(db.collection("reviews").doc(r.id), doc);
  }

  // Lightweight seed-customer user docs
  for (const [name, customerId] of seedCustomers) {
    batch.set(db.collection("users").doc(customerId), {
      uid: customerId,
      role: "customer",
      name,
      email: `${customerId}@seed.glamconnect.ai`,
      photoUrl: null,
      createdAt: now,
    });
  }

  await batch.commit();
  console.log(
    `✓ Wrote ${SALONS.length} salons, ${REVIEWS.length} reviews, ${seedCustomers.size} seed customers.\n`
  );

  console.log("Generating AI review summaries (one Anthropic call per salon)...");
  let succeeded = 0;
  let failed = 0;

  for (const s of SALONS) {
    const salonReviews = reviewsBySalon.get(s.id) ?? [];
    try {
      const summary = await generateReviewSummary(s.name, s.area, salonReviews);
      if (summary) {
        await db.collection("salons").doc(s.id).update({ reviewSummary: summary });
        succeeded++;
        console.log(`  ✓ ${s.name}`);
      }
    } catch (err) {
      failed++;
      console.warn(`  ✗ ${s.name} — ${(err as Error).message}`);
    }
  }

  console.log(`\nDone. Review summaries: ${succeeded} succeeded, ${failed} failed.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
  });
