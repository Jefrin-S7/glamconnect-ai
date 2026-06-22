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
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search salons"
      className="glass rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 flex-1 min-w-0">
        <MapPin size={18} className="text-paper/50 shrink-0" aria-hidden="true" />
        <label htmlFor="discover-area" className="sr-only">Area in Chennai</label>
        <input
          id="discover-area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area — Anna Nagar, Adyar, OMR…"
          autoComplete="off"
          className="bg-transparent outline-none text-sm w-full min-w-0 placeholder:text-paper/40 text-paper focus-ring"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 flex-1 min-w-0">
        <Search size={18} className="text-paper/50 shrink-0" aria-hidden="true" />
        <label htmlFor="discover-service" className="sr-only">Service type</label>
        <input
          id="discover-service"
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service — bridal makeup, haircut…"
          autoComplete="off"
          className="bg-transparent outline-none text-sm w-full min-w-0 placeholder:text-paper/40 text-paper focus-ring"
        />
      </div>
      <Button type="submit" className="shrink-0 w-full sm:w-auto">Search</Button>
    </form>
  );
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) params.set(key, trimmed);
  else params.delete(key);
}
