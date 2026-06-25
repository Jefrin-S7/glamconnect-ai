"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ { q: string; a: string; }

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={faq.q} className="glass rounded-2xl overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-ring"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`faq-answer-${i}`}
            id={`faq-btn-${i}`}
          >
            <span className="font-medium text-sm sm:text-base text-paper">{faq.q}</span>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={cn("shrink-0 text-paper/60 transition-transform duration-200", open === i && "rotate-180")}
            />
          </button>
          <div
            id={`faq-answer-${i}`}
            role="region"
            aria-labelledby={`faq-btn-${i}`}
            hidden={open !== i}
          >
            <p className="px-5 pb-5 text-sm text-paper/65 leading-relaxed">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
