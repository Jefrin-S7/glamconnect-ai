import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import type { AppUser } from "@/types";

/**
 * Reads and verifies the session cookie, then loads the matching Firestore
 * profile. Use this in Server Components that need to know *who* is signed
 * in (middleware only decides *whether* to let the request through).
 */
export async function getSessionUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const doc = await getAdminDb().collection("users").doc(decoded.uid).get();
    return doc.exists ? (doc.data() as AppUser) : null;
  } catch {
    return null;
  }
}
