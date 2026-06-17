"use server";

import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_MS } from "@/lib/auth/constants";

/**
 * Completes Google sign-in after the client has already run
 * signInWithPopup() via the Firebase client SDK — Google's OAuth popup can
 * only be triggered from the browser, so this action picks up from there
 * rather than initiating the popup itself.
 *
 * Verifies the ID token server-side, creates the user's Firestore profile
 * with role: "customer" on first sign-in, and mints an httpOnly session
 * cookie that middleware and Server Components can read without calling
 * Firebase on every request.
 */
export async function completeGoogleSignIn(idToken: string) {
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  const decoded = await adminAuth.verifyIdToken(idToken);
  const { uid, email, name, picture } = decoded;

  const userRef = adminDb.collection("users").doc(uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    await userRef.set({
      uid,
      role: "customer",
      name: name ?? "",
      email: email ?? "",
      photoUrl: picture ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  // Session cookies need a *fresh* ID token (issued in the last 5 minutes) —
  // true immediately after signInWithPopup, so this always succeeds here.
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  const profile = snapshot.exists ? snapshot.data() : (await userRef.get()).data();

  return { uid, role: (profile?.role as string | undefined) ?? "customer" };
}

/** Clears the session cookie. Safe to bind directly to a <form action>. */
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
