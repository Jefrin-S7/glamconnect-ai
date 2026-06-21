import { searchSalons } from "@/actions/discovery";
import { SearchBar } from "@/components/discovery/search-bar";
import { FilterBar } from "@/components/discovery/filter-bar";
import { SalonCard } from "@/components/discovery/salon-card";
import { CHENNAI_AREAS, PRICE_TIERS } from "@/lib/constants";
import type { PriceTier } from "@/types";

interface DiscoverPageProps {
  searchParams: Promise<{
    area?: string;
    service?: string;
    areaFilter?: string;
    price?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const params = await searchParams;
  const priceTiers = (params.price?.split(",").filter(Boolean) ?? []) as PriceTier[];

  const results = await searchSalons({
    areaQuery: params.area,
    serviceQuery: params.service,
    areaFilter: params.areaFilter,
    priceTiers,
  });

  return (
    <main className="min-h-screen bg-ink">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <h1 className="font-display text-3xl font-semibold text-paper">
          Discover salons <span className="gradient-text">matched to you</span>
        </h1>
        <p className="text-paper/60 mt-2">
          {results.length} salon{results.length === 1 ? "" : "s"} found
        </p>

        <div className="mt-8">
          <SearchBar />
          <FilterBar areas={CHENNAI_AREAS} priceTiers={PRICE_TIERS} />
        </div>

        {results.length === 0 ? (
          <p className="text-paper/50 mt-16 text-center">
            No salons match those filters yet — try widening your search.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {results.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
