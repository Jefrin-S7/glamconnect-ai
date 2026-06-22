import Link from "next/link";
import { Heart, Sparkles, Star, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import type { SalonSearchResult } from "@/actions/discovery";

interface SalonCardProps {
  salon: SalonSearchResult;
}

export function SalonCard({ salon }: SalonCardProps) {
  const iconName = salon.galleryAccent.icon as keyof typeof Icons;
  const Icon = (Icons[iconName] as LucideIcon | undefined) ?? Sparkles;

  return (
    <article className="glass rounded-2xl overflow-hidden card-hover">
      {/* Gradient thumbnail — decorative, no meaningful image content */}
      <div
        className="h-32 flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${salon.galleryAccent.from}, ${salon.galleryAccent.to})`,
        }}
        aria-hidden="true"
      >
        <Icon size={36} className="text-white/90" />
        <span
          className="absolute top-3 right-3 text-xs font-bold bg-ink/70 backdrop-blur px-2.5 py-1 rounded-full text-paper"
          aria-label={`${salon.matchScore}% match score`}
        >
          {salon.matchScore}% Match
        </span>
        {/* Favourite is a nice-to-have at this stage — marked disabled
            so it's keyboard-reachable but clearly not yet wired */}
        <button
          type="button"
          aria-label={`Save ${salon.name} to favourites`}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-ink/50 backdrop-blur flex items-center justify-center focus-ring"
        >
          <Heart size={15} className="text-paper" aria-hidden="true" />
        </button>
      </div>

      <Link
        href={`/salon/${salon.id}`}
        className="block p-5 focus-ring rounded-b-2xl"
        aria-label={`View ${salon.name} — ${salon.area}, ${salon.priceTier}, rated ${salon.ratingAvg} stars`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-paper leading-tight">
            {salon.name}
          </h3>
          <span
            className="flex items-center gap-1 text-sm text-jasmine font-semibold shrink-0 ml-2"
            aria-hidden="true"
          >
            <Star size={14} fill="currentColor" />
            {salon.ratingAvg.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-paper/55 mt-1">
          {salon.area} · {salon.priceTier}
        </p>
        {salon.matchReasons.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-3" aria-label="Why this salon matches">
            {salon.matchReasons.slice(0, 2).map((reason) => (
              <li
                key={reason}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/70"
              >
                {reason}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  );
}
