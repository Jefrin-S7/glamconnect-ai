import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-ink flex items-center justify-center p-8">
      <div className="glass rounded-3xl p-10 max-w-md text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light">
          <Sparkles size={14} /> Scaffold check
        </span>
        <h1 className="font-display text-3xl font-semibold mt-4 text-paper">
          <span className="gradient-text">GlamConnect AI</span>
        </h1>
        <p className="text-paper/70 mt-3 text-sm">
          Next.js 15 + TypeScript + Tailwind v4 + shadcn primitives are wired up.
          Fraunces and Manrope are loading via next/font/google, and this card
          is using the real <code>.glass</code> class ported from the
          landing prototype.
        </p>
        <div className="flex justify-center gap-3 mt-7">
          <Button>Primary action</Button>
          <Button variant="ghost">Ghost action</Button>
        </div>
      </div>
    </main>
  );
}
