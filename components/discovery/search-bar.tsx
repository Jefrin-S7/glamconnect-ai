"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [area, setArea] = useState(searchParams.get("area") ?? "");
  const [service, setService] = useState(searchParams.get("service") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    setOrDelete(params, "area", area);
    setOrDelete(params, "service", service);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 flex-1">
        <MapPin size={18} className="text-paper/50 shrink-0" />
        <label htmlFor="discover-area" className="sr-only">Area</label>
        <input
          id="discover-area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area — Anna Nagar, Adyar, OMR…"
          className="bg-transparent outline-none text-sm w-full placeholder:text-paper/40 text-paper focus-ring"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 flex-1">
        <Search size={18} className="text-paper/50 shrink-0" />
        <label htmlFor="discover-service" className="sr-only">Service</label>
        <input
          id="discover-service"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service — bridal makeup, haircut…"
          className="bg-transparent outline-none text-sm w-full placeholder:text-paper/40 text-paper focus-ring"
        />
      </div>
      <Button type="submit" className="shrink-0">Search</Button>
    </form>
  );
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) params.set(key, trimmed);
  else params.delete(key);
}
