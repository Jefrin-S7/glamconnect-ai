"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { completeGoogleSignIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";

/**
 * The Google OAuth popup can only be triggered from the browser, so this
 * Client Component owns that step, then hands off to the
 * completeGoogleSignIn Server Action for everything that has to happen
 * server-side (verifying the token, creating the user doc, setting the
 * session cookie).
 */
export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();
      const { role } = await completeGoogleSignIn(idToken);

      const requestedRedirect = searchParams.get("redirect");
      const fallback = role === "salon_owner" ? "/owner" : "/dashboard";
      router.push(requestedRedirect || fallback);
      router.refresh(); // re-fetch Server Components now that the cookie is set
    } catch (err) {
      console.error(err);
      setError("Sign-in failed — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <Button onClick={handleClick} disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Continue with Google"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
