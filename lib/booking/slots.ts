/**
 * Pure slot-math helpers shared by getAvailableSlots and createBooking.
 * No Firestore or network calls — everything here is deterministic given
 * its inputs, which is what keeps the booking page's availability logic
 * testable and easy to reason about.
 */

/** Salon business hours, in minutes since midnight — 10:00 to 20:00. */
export const BUSINESS_OPEN_MINUTES = 10 * 60;
export const BUSINESS_CLOSE_MINUTES = 20 * 60;

/** Candidate slots start every 30 minutes within business hours. */
export const SLOT_INTERVAL_MINUTES = 30;

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Two [start, start+duration) intervals overlap if each starts before the other ends. */
export function intervalsOverlap(
  aStart: number,
  aDuration: number,
  bStart: number,
  bDuration: number
): boolean {
  return aStart < bStart + bDuration && bStart < aStart + aDuration;
}

/**
 * Every slot start time, at SLOT_INTERVAL_MINUTES resolution, where a
 * service of the given duration would still finish before closing time.
 */
export function generateCandidateSlots(durationMinutes: number): string[] {
  const slots: string[] = [];
  for (
    let start = BUSINESS_OPEN_MINUTES;
    start + durationMinutes <= BUSINESS_CLOSE_MINUTES;
    start += SLOT_INTERVAL_MINUTES
  ) {
    slots.push(minutesToTime(start));
  }
  return slots;
}

/**
 * Chennai is single-timezone (Asia/Kolkata, UTC+5:30, no DST), so reading
 * "today"/"now" via Intl with an explicit timeZone keeps this correct
 * regardless of where the server process itself runs, without pulling in
 * a date library for one conversion. hourCycle "h23" (rather than
 * hour12: false) avoids an ICU quirk where midnight can format as "24"
 * instead of "00".
 */
export function getCurrentDateTimeInIST(): { date: string; minutes: number } {
  const now = new Date();

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => dateParts.find((p) => p.type === type)?.value ?? "00";
  const date = `${part("year")}-${part("month")}-${part("day")}`;

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(timeParts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(timeParts.find((p) => p.type === "minute")?.value ?? "0");

  return { date, minutes: hour * 60 + minute };
}
