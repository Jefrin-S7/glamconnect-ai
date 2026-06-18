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
