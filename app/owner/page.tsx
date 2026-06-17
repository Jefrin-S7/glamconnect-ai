import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { signOutAction } from "@/actions/auth";

// Placeholder — fleshed out into service management + the AI marketing
// assistant in later prompts. Role-gating beyond "is anyone signed in"
// (e.g. requiring role === "salon_owner") is a deliberate next step, not
// done here yet.
export default async function OwnerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-8">
      <div className="glass rounded-3xl p-10 max-w-sm w-full text-center">
        <p className="text-paper/50 text-xs uppercase tracking-wider">
          Salon owner dashboard — placeholder
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
