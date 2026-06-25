import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, LogOut, Search, Sparkles, Star } from "lucide-react";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { signOutAction } from "@/actions/auth";
import { getCustomerBookings } from "@/actions/bookings";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  confirmed:  "bg-violet/20 text-violet-light border-violet/30",
  completed:  "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
  pending:    "bg-jasmine/15 text-jasmine border-jasmine/30",
};

const QUICK_LINKS = [
  { label: "Find a salon",    href: "/discover",      Icon: Search },
  { label: "AI Beauty Advice",href: "/ai-assistant",  Icon: Sparkles },
  { label: "Salon dashboard", href: "/owner",         Icon: Star },
];

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in?redirect=/dashboard");

  const bookings = await getCustomerBookings(user.uid);
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <main id="main-content" className="min-h-screen bg-ink">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-line backdrop-blur-xl bg-ink/90">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold focus-ring text-paper">
            <span className="w-6 h-6 rounded-full match-ring flex items-center justify-center" aria-hidden="true">
              <span className="w-3.5 h-3.5 rounded-full bg-ink" />
            </span>
            GlamConnect <span className="text-violet-light">AI</span>
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="flex items-center gap-1.5 text-sm text-paper/60 hover:text-paper focus-ring">
              <LogOut size={15} aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 space-y-10">

        {/* Welcome */}
        <section>
          <p className="text-paper/50 text-sm uppercase tracking-wider">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold text-paper mt-1">
            Hey, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-paper/60 mt-1 text-sm">{user.email}</p>
        </section>

        {/* Quick actions */}
        <section aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-xs uppercase tracking-wider text-paper/50 mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_LINKS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                className="glass rounded-2xl p-5 flex items-center gap-4 card-hover focus-ring group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet/15 border border-violet/30 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-violet-light" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-paper font-medium text-sm">{label}</p>
                  <p className="text-paper/45 text-xs mt-0.5">Tap to open →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Booking history */}
        <section aria-labelledby="bookings-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="bookings-heading" className="text-xs uppercase tracking-wider text-paper/50">
              Your bookings
            </h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/discover">
                Book again <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {bookings.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Calendar size={32} className="text-paper/20 mx-auto mb-3" aria-hidden="true" />
              <p className="text-paper/60 font-medium">No bookings yet</p>
              <p className="text-paper/40 text-sm mt-1">Find a salon and make your first booking</p>
              <Button asChild className="mt-5">
                <Link href="/discover">Browse salons</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar size={16} className="text-violet-light" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-paper font-semibold text-sm">{booking.salonId.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</p>
                      <p className="text-paper/55 text-xs mt-0.5 flex items-center gap-1.5">
                        <Clock size={11} aria-hidden="true" />
                        {booking.date} · {booking.timeSlot} · {booking.durationMinutes} min
                      </p>
                      <p className="text-paper/40 text-xs mt-1">Ref: {booking.reference}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[booking.status] ?? "bg-white/5 text-paper/60 border-line"}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/salon/${booking.salonId}`}>View salon</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommendations nudge */}
        <section className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl match-ring flex items-center justify-center shrink-0">
              <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
                <Sparkles size={18} className="text-violet-light" aria-hidden="true" />
              </div>
            </div>
            <div>
              <p className="text-paper font-semibold">Get personalised recommendations</p>
              <p className="text-paper/55 text-sm mt-0.5">Tell our AI your hair type and preferences</p>
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto shrink-0">
            <Link href="/ai-assistant">Try AI assistant</Link>
          </Button>
        </section>

      </div>
    </main>
  );
}
