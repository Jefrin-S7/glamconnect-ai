"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { generateMarketingCopy, type MarketingContentType } from "@/actions/ai";

interface MarketingAssistantProps {
  salonName: string;
  area: string;
}

const CONTENT_TYPES: { id: MarketingContentType; label: string; hint: string }[] = [
  { id: "instagram_caption",  label: "Instagram caption",  hint: "Emoji-rich · hashtags · ~200 words" },
  { id: "festival_offer",     label: "Festival offer",     hint: "Urgency · discount · ~100 words" },
  { id: "whatsapp_campaign",  label: "WhatsApp campaign",  hint: "Personalised · clear CTA · ~80 words" },
];

const TONES: { id: "professional" | "casual" | "festive"; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "casual",       label: "Casual" },
  { id: "festive",      label: "Festive" },
];

export function MarketingAssistant({ salonName, area }: MarketingAssistantProps) {
  const [contentType, setContentType] = useState<MarketingContentType>("instagram_caption");
  const [serviceName, setServiceName]   = useState("");
  const [discount, setDiscount]         = useState(20);
  const [tone, setTone]                 = useState<"professional" | "casual" | "festive">("casual");
  const [draft, setDraft]               = useState("");
  const [error, setError]               = useState("");
  const [copied, setCopied]             = useState(false);
  const [generating, startGenerate]     = useTransition();

  function handleGenerate() {
    setError("");
    setDraft("");
    setCopied(false);
    startGenerate(async () => {
      try {
        const result = await generateMarketingCopy({
          salonName, area, contentType, serviceName, discountPercent: discount, tone,
        });
        setDraft(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
      }
    });
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass =
    "bg-white/5 border border-line rounded-xl px-4 py-2.5 text-sm text-paper outline-none focus-ring placeholder:text-paper/40";

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-paper mb-5">
        AI Marketing Assistant
      </h2>

      {/* 1. Content type */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-wider text-paper/50 mb-3">Content type</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => setContentType(ct.id)}
              aria-pressed={ct.id === contentType}
              className={cn(
                "chip text-left rounded-xl p-4",
                ct.id === contentType && "bg-violet/15 border-violet-light"
              )}
            >
              <p className="text-paper font-medium text-sm">{ct.label}</p>
              <p className="text-paper/45 text-xs mt-1">{ct.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Inputs */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label htmlFor="mkt-service" className="text-xs text-paper/50 mb-1.5 block">
            Service to promote
          </label>
          <input
            id="mkt-service"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="e.g. Glass Skin Facial"
            className={cn(inputClass, "w-full")}
          />
        </div>
        <div>
          <label htmlFor="mkt-discount" className="text-xs text-paper/50 mb-1.5 block">
            Discount (%)
          </label>
          <input
            id="mkt-discount"
            type="number"
            min={1}
            max={90}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className={cn(inputClass, "w-full")}
          />
        </div>
      </div>

      {/* 3. Tone */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-paper/50 mb-2">Tone</p>
        <div className="flex gap-2" role="group" aria-label="Select tone">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              aria-pressed={t.id === tone}
              className={cn(
                "chip text-sm px-4 py-2 rounded-full",
                t.id === tone ? "bg-violet/20 border-violet-light text-paper" : "text-paper/65"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={generating || !serviceName.trim()} className="w-full sm:w-auto">
        {generating
          ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
          : <><Sparkles size={16} /> Generate copy</>}
      </Button>

      {error && <p className="text-sm text-destructive mt-4">{error}</p>}

      {/* 4. Result */}
      {(draft || generating) && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-paper/50">Your draft</p>
            {draft && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-violet-light hover:text-violet-pale focus-ring"
              >
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            )}
          </div>
          {generating ? (
            <div className="glass rounded-xl p-4 min-h-[120px] flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-paper/40" />
            </div>
          ) : (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              className="w-full bg-white/5 border border-line rounded-xl px-4 py-3 text-sm text-paper outline-none focus-ring resize-y"
              aria-label="Generated marketing copy — edit before using"
            />
          )}
          {draft && (
            <p className="text-xs text-paper/35 mt-1.5">
              Edit the draft above before posting — AI copy always benefits from a human read.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
