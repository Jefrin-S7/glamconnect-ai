import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Star, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { getSalonProfile } from "@/actions/salons";
import { Button } from "@/components/ui/button";

interface SalonProfilePageProps {
  params: Promise<{ salonId: string }>;
}

export default async function SalonProfilePage({ params }: SalonProfilePageProps) {
  const { salonId } = await params;
  const salon = await getSalonProfile(salonId);

  if (!salon) notFound();

  const iconName = salon.galleryAccent.icon as keyof typeof Icons;
  const Icon = (Icons[iconName] as LucideIcon | undefined) ?? Sparkles;

  return (
    <main className="min-h-screen bg-ink">
      <div
        className="h-56 sm:h-64 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${salon.galleryAccent.from}, ${salon.galleryAccent.to})` }}
      >
        <Icon size={56} className="text-white/90" />
        <Link
          href="/discover"
          className="absolute top-5 left-5 flex items-center gap-1.5 text-sm font-medium text-white/90 bg-ink/40 backdrop-blur px-3 py-1.5 rounded-full focus-ring"
        >
          <ArrowLeft size={15} /> Discover
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 -mt-10 relative z-10">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-paper">{salon.name}</h1>
              <p className="text-paper/60 mt-1">
                {salon.area} · {salon.priceTier}
              </p>
            </div>
            <span className="flex items-center gap-1 text-jasmine font-semibold shrink-0">
              <Star size={16} fill="currentColor" /> {salon.ratingAvg.toFixed(1)}
            </span>
          </div>
          {salon.category.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {salon.category.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-paper">Services</h2>
          <div className="mt-4 space-y-3">
            {salon.services.map((service) => (
              <div
                key={service.id}
                className="glass rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-paper font-medium">{service.name}</p>
                  <p className="text-paper/50 text-sm mt-0.5">
                    {service.durationMinutes} min · {service.category}
                  </p>
                </div>
                <p className="text-paper font-semibold shrink-0">
                  ₹{service.price.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {salon.reviewSummary && (
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-paper">What customers say</h2>
            <div className="glass rounded-2xl p-6 mt-4 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/50 mb-3">Strengths</p>
                {salon.reviewSummary.strengths.length > 0 ? (
                  <ul className="space-y-2 text-sm text-paper/80">
                    {salon.reviewSummary.strengths.map((s) => (
                      <li key={s} className="flex gap-2">
                        <Check size={15} className="text-violet-light mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-paper/50">Not enough reviews yet to summarize.</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-paper/50 mb-3">Worth knowing</p>
                {salon.reviewSummary.weaknesses.length > 0 ? (
                  <ul className="space-y-2 text-sm text-paper/80">
                    {salon.reviewSummary.weaknesses.map((w) => (
                      <li key={w} className="flex gap-2">
                        <Check size={15} className="text-paper/40 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-paper/50">No notable concerns in recent reviews.</p>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mt-10 mb-16 flex justify-center">
          <Button asChild size="lg">
            <Link href={`/booking/${salon.id}/new`}>Book now</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
