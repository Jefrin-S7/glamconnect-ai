import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-8">
      <div className="glass rounded-3xl p-10 max-w-sm w-full text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light">
          <Sparkles size={14} /> Sign in
        </span>
        <h1 className="font-display text-2xl font-semibold mt-4 text-paper">
          Welcome back to <span className="gradient-text">GlamConnect AI</span>
        </h1>
        <p className="text-paper/60 text-sm mt-2">
          Google sign-in only for now — email/password is intentionally out
          of scope for the MVP.
        </p>
        <div className="mt-7">
          {/* useSearchParams() inside the button needs a Suspense boundary */}
          <Suspense fallback={null}>
            <GoogleSignInButton />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
