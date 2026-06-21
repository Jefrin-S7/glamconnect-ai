"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/auth/get-session-user";
import {
  generateCandidateSlots,
  getCurrentDateTimeInIST,
  intervalsOverlap,
  timeToMinutes,
} from "@/lib/booking/slots";
import type { Booking, Salon } from "@/types";

export interface GetAvailableSlotsInput {
  salonId: string;
  /** "YYYY-MM-DD" */
  date: string;
  durationMinutes: number;
}

/**
 * Computes open slots for a salon on a given date: every candidate start
 * time (see generateCandidateSlots) that doesn't overlap an existing
 * confirmed booking, with already-passed slots excluded when the date is
 * today.
 */
export async function getAvailableSlots(input: GetAvailableSlotsInput): Promise<string[]> {
  const { salonId, date, durationMinutes } = input;
  const db = getAdminDb();

  // Multiple equality (==) filters merge automatically from Firestore's
  // single-field indexes — this query needs no composite index. Only
  // "confirmed" bookings block a slot; this build writes that status
  // directly (see createBooking below) rather than ever creating
  // "pending" bookings that would also need to be considered here.
  const snapshot = await db
    .collection("bookings")
    .where("salonId", "==", salonId)
    .where("date", "==", date)
    .where("status", "==", "confirmed")
    .get();

  const existingBookings = snapshot.docs.map((doc) => doc.data() as Booking);

  let candidates = generateCandidateSlots(durationMinutes);

  const today = getCurrentDateTimeInIST();
  if (date < today.date) {
    return []; // fully past date — nothing to offer
  }
  if (date === today.date) {
    candidates = candidates.filter((slot) => timeToMinutes(slot) > today.minutes);
  }

  return candidates.filter((slot) => {
    const slotStart = timeToMinutes(slot);
    return !existingBookings.some((booking) =>
      intervalsOverlap(slotStart, durationMinutes, timeToMinutes(booking.timeSlot), booking.durationMinutes)
    );
  });
}

export interface CreateBookingInput {
  salonId: string;
  serviceId: string;
  /** "YYYY-MM-DD" */
  date: string;
  timeSlot: string;
}

export interface CreateBookingResult {
  bookingId: string;
  reference: string;
}

/**
 * Writes a confirmed booking directly.
 *
 * KNOWN SIMPLIFICATION: the Technical Architecture doc's Booking System
 * Design (Section 9) calls for a Firestore *transaction* that locks the
 * specific slot before writing — the only way to fully close the race
 * where two customers request the same slot within milliseconds of each
 * other. This build re-validates availability with a fresh read
 * immediately before writing instead, which closes the gap in practice at
 * buildathon-scale traffic but is not a real guarantee under concurrent
 * load. Swap this for the transactional version before charging
 * commission on it.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("You need to sign in before booking.");
  }

  const db = getAdminDb();
  const salonSnap = await db.collection("salons").doc(input.salonId).get();
  if (!salonSnap.exists) {
    throw new Error("This salon no longer exists.");
  }
  const salon = salonSnap.data() as Salon;

  // Re-derive duration/price from the salon's own service data rather than
  // trusting whatever the client last had loaded — the client's copy could
  // be stale, or simply wrong if someone tampered with the request.
  const service = salon.services.find((s) => s.id === input.serviceId);
  if (!service) {
    throw new Error("This service is no longer available.");
  }

  const stillAvailable = await getAvailableSlots({
    salonId: input.salonId,
    date: input.date,
    durationMinutes: service.durationMinutes,
  });
  if (!stillAvailable.includes(input.timeSlot)) {
    throw new Error("That slot was just booked by someone else — please pick another time.");
  }

  const bookingRef = db.collection("bookings").doc();
  const reference = `GCA-${bookingRef.id.slice(0, 6).toUpperCase()}`;

  const booking: Booking = {
    id: bookingRef.id,
    reference,
    customerId: user.uid,
    salonId: input.salonId,
    serviceId: input.serviceId,
    date: input.date,
    timeSlot: input.timeSlot,
    durationMinutes: service.durationMinutes,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  await bookingRef.set(booking);

  return { bookingId: booking.id, reference };
}
