"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askBeautyAssistant } from "@/actions/ai";
import type { BeautyAssistantResult } from "@/types";

const PRESETS = [
  "Curly hair, oval face, looking for a fresh cut",
  "Frizzy hair, round face, Chennai humidity is winning",
  "Bridal makeup, oily skin, fair tone, outdoor wedding",
];

const LOADING_MESSAGES = [
  "Reading your hair type…",
  "Cross-checking face shape…",
  "Matching nearby salons…",
];

export function BeautyAssistant() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState<BeautyAssistantResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [loading]);

  async function ask(text?: string) {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput(query);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await askBeautyAssistant(query);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => ask(preset)}
            className="chip text-xs sm:text-sm px-3.5 py-2 rounded-full text-paper/75 focus-ring"
          >
            {preset}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="flex gap-3"
      >
        <label htmlFor="ai-input" className="sr-only">Describe your hair and face shape</label>
        <input
          id="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. I have curly hair and an oval face shape"
          className="flex-1 bg-white/5 border border-line rounded-xl px-4 py-3 text-sm outline-none placeholder:text-paper/40 text-paper focus-ring"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Ask
        </Button>
      </form>

      {loading && (
        <div className="flex items-center gap-4 mt-8">
          <div className="w-12 h-12 rounded-full match-ring spin-slow shrink-0" />
          <p className="text-sm text-paper/60">{LOADING_MESSAGES[loadingMsgIdx]}</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-6">{error}</p>}

      {result && !loading && (
        <div className="grid sm:grid-cols-2 gap-6 mt-8 fade-up">
          <div>
            <p className="text-xs uppercase tracking-wider text-paper/50 mb-2">Hairstyle suggestions</p>
            <ul className="space-y-2 text-sm text-paper">
              {result.hairstyles.map((h) => (
                <li key={h} className="flex gap-2">
                  <Check size={15} className="text-violet-light mt-0.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <p className="text-xs uppercase tracking-wider text-paper/50 mb-2 mt-5">Haircare tip</p>
            <p className="text-sm text-paper/80">{result.haircareTip}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-paper/50 mb-2">Recommended services</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {result.services.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/70"
                >
                  {s}
                </span>
              ))}
            </div>

            <p className="text-xs uppercase tracking-wider text-paper/50 mb-2">Salons that fit</p>
            {result.salons.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {result.salons.map((salon) => (
                  <li key={salon.id} className="border-b border-line/60 pb-2">
                    <Link
                      href={`/salon/${salon.id}`}
                      className="flex justify-between items-baseline gap-3 hover:text-violet-light focus-ring"
                    >
                      <span className="text-paper">{salon.name}</span>
                      <span className="text-paper/50 text-xs shrink-0">{salon.area}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-paper/50">
                No current listings match those categories yet —{" "}
                <Link href="/discover" className="text-violet-light hover:underline focus-ring">
                  browse all salons
                </Link>
                .
              </p>
            )}
          </div>

          <p className="sm:col-span-2 text-xs text-paper/40 pt-2 border-t border-line">
            Matched against live GlamConnect AI listings.
          </p>
        </div>
      )}
    </div>
  );
}
