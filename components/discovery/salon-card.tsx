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
    <div className="glass rounded-2xl overflow-hidden card-hover">
      <div
        className="h-32 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${salon.galleryAccent.from}, ${salon.galleryAccent.to})` }}
      >
        <Icon size={36} className="text-white/90" />
        <span className="absolute top-3 right-3 text-xs font-bold bg-ink/70 backdrop-blur px-2.5 py-1 rounded-full text-paper">
          {salon.matchScore}% Match
        </span>
        <button
          type="button"
          aria-label={`Save ${salon.name}`}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-ink/50 backdrop-blur flex items-center justify-center focus-ring"
        >
          <Heart size={15} className="text-paper" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-paper">{salon.name}</h3>
          <span className="flex items-center gap-1 text-sm text-jasmine font-semibold shrink-0">
            <Star size={14} fill="currentColor" /> {salon.ratingAvg.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-paper/55 mt-1">
          {salon.area} · {salon.priceTier}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {salon.matchReasons.slice(0, 2).map((reason) => (
            <span
              key={reason}
              className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/70"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
