"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Discover",     href: "/discover" },
  { label: "AI Assistant", href: "/ai-assistant" },
  { label: "Trending",     href: "#trending" },
  { label: "For Salons",   href: "/owner" },
  { label: "Dashboard",    href: "/dashboard" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-line focus-ring"
      >
        {open
          ? <X size={20} className="text-paper" aria-hidden="true" />
          : <Menu size={20} className="text-paper" aria-hidden="true" />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute top-16 left-0 right-0 bg-ink/95 backdrop-blur-xl border-b border-line px-5 py-5 flex flex-col gap-1 z-50"
          role="dialog"
          aria-label="Navigation menu"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-paper/80 hover:text-paper text-base font-medium py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors focus-ring"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 mt-1 border-t border-line">
            <Button asChild variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              <Link href="/auth/sign-in">Log in</Link>
            </Button>
            <Button asChild className="flex-1" onClick={() => setOpen(false)}>
              <Link href="/auth/sign-in">Get started</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
