import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { signOutAction } from "@/actions/auth";

// Placeholder — fleshed out into booking history / favorites / recommendations
// in later prompts. Its job right now is to prove the auth loop works.
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-8">
      <div className="glass rounded-3xl p-10 max-w-sm w-full text-center">
        <p className="text-paper/50 text-xs uppercase tracking-wider">
          Customer dashboard — placeholder
        </p>
        <h1 className="font-display text-2xl font-semibold mt-3 text-paper">
          Hey, {user.name?.split(" ")[0] || "there"}.
        </h1>
        <p className="text-paper/60 text-sm mt-2">
          Signed in as {user.email} · role: {user.role}
        </p>
        <form action={signOutAction} className="mt-6">
          <button className="text-sm text-violet-light hover:underline">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
