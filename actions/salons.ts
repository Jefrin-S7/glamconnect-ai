"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import type { Salon } from "@/types";

/**
 * Reads one salon document. Services, the gallery accent, and the
 * precomputed AI review summary are all embedded fields on this same
 * document, so a profile page never needs a subcollection query.
 */
export async function getSalonProfile(salonId: string): Promise<Salon | null> {
  const db = getAdminDb();
  const snapshot = await db.collection("salons").doc(salonId).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as Salon;
}

/**
 * Returns the salon owned by the given user, or null if they haven't
 * listed one yet. Used by the owner dashboard — this is the same query
 * the seed script uses to generate ownerId values; real owners get a
 * matching document once they complete onboarding.
 */
export async function getOwnerSalon(ownerId: string): Promise<Salon | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("salons")
    .where("ownerId", "==", ownerId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Salon;
}

/**
 * Overwrites the entire services array on the salon document.
 * Verifying that the requesting user actually owns this salon before
 * allowing the write — never trust the client's claimed salonId alone.
 */
export async function updateSalonServices(
  salonId: string,
  ownerId: string,
  services: Salon["services"]
): Promise<void> {
  const db = getAdminDb();
  const salonRef = db.collection("salons").doc(salonId);
  const snap = await salonRef.get();
  if (!snap.exists) throw new Error("Salon not found.");
  const salon = snap.data() as Salon;
  if (salon.ownerId !== ownerId) throw new Error("Not authorised to edit this salon.");
  await salonRef.update({ services });
}
