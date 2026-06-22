import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { signOutAction } from "@/actions/auth";
import { getOwnerSalon, getSalonProfile } from "@/actions/salons";
import { ServiceManager } from "@/components/owner/service-manager";
import { MarketingAssistant } from "@/components/owner/marketing-assistant";

/**
 * Demo mode: if the signed-in user doesn't own a salon yet (which is
 * always true in a buildathon context where seeded salons use fake
 * ownerIds), we fall back to showing "salon-01" in read/write demo mode
 * so judges can interact with the full feature set. A production build
 * would show a "list your salon" onboarding flow instead.
 */
const DEMO_SALON_ID = "salon-01";

export default async function OwnerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in?redirect=/owner");

  const ownedSalon = await getOwnerSalon(user.uid);
  const isDemo = !ownedSalon;
  const salon = ownedSalon ?? (await getSalonProfile(DEMO_SALON_ID));

  if (!salon) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-paper/60 text-sm">No salons found in the database.</p>
          <p className="text-paper/40 text-xs mt-2">Run <code>npm run seed</code> first.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink">
      {/* Topbar */}
      <header className="border-b border-line backdrop-blur-xl bg-ink/80 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-paper">
            <LayoutDashboard size={16} className="text-violet-light" />
            Salon dashboard
          </div>
          <div className="flex items-center gap-4">
            <Link href="/discover" className="text-xs text-paper/55 hover:text-paper focus-ring">
              ← Back to app
            </Link>
            <form action={signOutAction}>
              <button className="text-xs text-paper/55 hover:text-paper focus-ring">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        {/* Salon identity */}
        <div className="glass rounded-2xl p-6 mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl font-semibold text-paper">{salon.name}</h1>
              {isDemo && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-jasmine/15 border border-jasmine/40 text-jasmine font-semibold">
                  Demo mode
                </span>
              )}
            </div>
            <p className="text-paper/55 text-sm mt-1">{salon.area} · {salon.priceTier}</p>
            {isDemo && (
              <p className="text-paper/40 text-xs mt-2">
                Showing demo data — sign in with an account linked to a real salon to manage your own listings.
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-violet-light">
            <Sparkles size={15} />
            <span className="text-xs font-semibold">AI-powered dashboard</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-8">
          {/* Section 1: Service Manager */}
          <section className="glass rounded-2xl p-6">
            <ServiceManager
              salonId={salon.id}
              ownerId={isDemo ? salon.ownerId : user.uid}
              initialServices={salon.services}
            />
          </section>

          {/* Section 2: AI Marketing Assistant */}
          <section className="glass rounded-2xl p-6">
            <MarketingAssistant salonName={salon.name} area={salon.area} />
          </section>
        </div>
      </div>
    </main>
  );
}
