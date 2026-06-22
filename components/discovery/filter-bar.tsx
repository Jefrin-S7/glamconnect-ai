"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PriceTier } from "@/types";

interface FilterBarProps {
  areas: readonly string[];
  priceTiers: readonly PriceTier[];
}

export function FilterBar({ areas, priceTiers }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const areaFilter = searchParams.get("areaFilter") ?? "";
  const activeTiers = new Set(searchParams.get("price")?.split(",").filter(Boolean) ?? []);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleTier(tier: PriceTier) {
    const next = new Set(activeTiers);
    if (next.has(tier)) next.delete(tier);
    else next.add(tier);
    updateParam("price", Array.from(next).join(","));
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3 mt-4"
      role="group"
      aria-label="Filter salons"
    >
      <div>
        <label htmlFor="discover-area-filter" className="sr-only">
          Filter by area
        </label>
        <select
          id="discover-area-filter"
          value={areaFilter}
          onChange={(e) => updateParam("areaFilter", e.target.value)}
          className="bg-ink border border-line rounded-full px-4 py-2 text-sm text-paper outline-none focus-ring cursor-pointer"
        >
          <option value="">All areas</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by price tier"
      >
        {priceTiers.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => toggleTier(tier)}
            aria-pressed={activeTiers.has(tier)}
            aria-label={`Price tier ${tier}${activeTiers.has(tier) ? ", active" : ""}`}
            className={cn(
              "chip text-sm px-3.5 py-1.5 rounded-full focus-ring",
              activeTiers.has(tier)
                ? "bg-violet/20 border-violet-light text-paper"
                : "text-paper/65"
            )}
          >
            {tier}
          </button>
        ))}
      </div>
    </div>
  );
}
