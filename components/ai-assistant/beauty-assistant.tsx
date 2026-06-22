"use client";

import { useId, useReducer, useEffect, useRef } from "react";
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

type State =
  | { status: "idle"; input: string }
  | { status: "loading"; input: string; msgIdx: number }
  | { status: "success"; input: string; result: BeautyAssistantResult }
  | { status: "error"; input: string; message: string };

type Action =
  | { type: "SET_INPUT"; value: string }
  | { type: "SUBMIT"; input: string }
  | { type: "TICK" }
  | { type: "SUCCESS"; result: BeautyAssistantResult }
  | { type: "ERROR"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, input: action.value };
    case "SUBMIT":
      return { status: "loading", input: action.input, msgIdx: 0 };
    case "TICK":
      return state.status === "loading"
        ? { ...state, msgIdx: (state.msgIdx + 1) % LOADING_MESSAGES.length }
        : state;
    case "SUCCESS":
      return { status: "success", input: state.input, result: action.result };
    case "ERROR":
      return { status: "error", input: state.input, message: action.message };
    default:
      return state;
  }
}

export function BeautyAssistant() {
  const uid = useId();
  const [state, dispatch] = useReducer(reducer, { status: "idle", input: "" });
  const resultsRef = useRef<HTMLDivElement>(null);

  // Rotate loading message every 1.1 s while loading
  useEffect(() => {
    if (state.status !== "loading") return;
    const t = setInterval(() => dispatch({ type: "TICK" }), 1100);
    return () => clearInterval(t);
  }, [state.status]);

  // Move focus to results when they arrive
  useEffect(() => {
    if (state.status === "success" || state.status === "error") {
      resultsRef.current?.focus();
    }
  }, [state.status]);

  async function ask(text?: string) {
    const query = (text ?? (state.status !== "loading" ? state.input : "")).trim();
    if (!query) return;
    dispatch({ type: "SUBMIT", input: query });
    try {
      const result = await askBeautyAssistant(query);
      dispatch({ type: "SUCCESS", result });
    } catch (err) {
      dispatch({
        type: "ERROR",
        message: err instanceof Error ? err.message : "Something went wrong — please try again.",
      });
    }
  }

  const isLoading = state.status === "loading";

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Example queries">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={isLoading}
            onClick={() => ask(preset)}
            className="chip text-xs sm:text-sm px-3.5 py-2 rounded-full text-paper/75 focus-ring disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => { e.preventDefault(); ask(); }}
        className="flex gap-3"
      >
        <label htmlFor={`${uid}-ai-input`} className="sr-only">
          Describe your hair type, face shape, or skin
        </label>
        <input
          id={`${uid}-ai-input`}
          value={state.status !== "loading" ? state.input : state.input}
          onChange={(e) => dispatch({ type: "SET_INPUT", value: e.target.value })}
          placeholder="e.g. I have curly hair and an oval face shape"
          disabled={isLoading}
          aria-describedby={`${uid}-hint`}
          className="flex-1 min-w-0 bg-white/5 border border-line rounded-xl px-4 py-3 text-sm outline-none placeholder:text-paper/40 text-paper focus-ring disabled:opacity-50"
        />
        <Button type="submit" disabled={isLoading} aria-label={isLoading ? "Getting recommendations…" : "Ask the beauty assistant"}>
          {isLoading
            ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            : <Send size={16} aria-hidden="true" />}
          <span className="hidden sm:inline">{isLoading ? "Thinking…" : "Ask"}</span>
        </Button>
      </form>
      <p id={`${uid}-hint`} className="text-xs text-paper/35 mt-2">
        Powered by NVIDIA NIM · Results matched to live salon listings
      </p>

      {/* Loading state — polite live region; spinner is decorative */}
      {isLoading && (
        <div className="flex items-center gap-4 mt-8" aria-live="polite" aria-atomic="true">
          <div className="w-12 h-12 rounded-full match-ring spin-slow shrink-0" aria-hidden="true" />
          <p className="text-sm text-paper/60">
            {LOADING_MESSAGES[(state as Extract<State, { status: "loading" }>).msgIdx]}
          </p>
        </div>
      )}

      {/* Error — assertive so it's announced immediately */}
      {state.status === "error" && (
        <div
          ref={resultsRef}
          tabIndex={-1}
          aria-live="assertive"
          role="alert"
          className="mt-6 outline-none"
        >
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}

      {/* Results */}
      {state.status === "success" && (
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="grid sm:grid-cols-2 gap-6 mt-8 fade-up outline-none"
          aria-label="Beauty assistant recommendations"
        >
          <section aria-labelledby={`${uid}-styles`}>
            <h3 id={`${uid}-styles`} className="text-xs uppercase tracking-wider text-paper/50 mb-2">
              Hairstyle suggestions
            </h3>
            <ul className="space-y-2 text-sm text-paper" aria-label="Suggested hairstyles">
              {state.result.hairstyles.map((h) => (
                <li key={h} className="flex gap-2">
                  <Check size={15} className="text-violet-light mt-0.5 shrink-0" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
            <h3 className="text-xs uppercase tracking-wider text-paper/50 mb-2 mt-5">
              Haircare tip
            </h3>
            <p className="text-sm text-paper/80">{state.result.haircareTip}</p>
          </section>

          <section aria-labelledby={`${uid}-services`}>
            <h3 id={`${uid}-services`} className="text-xs uppercase tracking-wider text-paper/50 mb-2">
              Recommended services
            </h3>
            <ul className="flex flex-wrap gap-2 mb-5" aria-label="Service recommendations">
              {state.result.services.map((s) => (
                <li
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/70"
                >
                  {s}
                </li>
              ))}
            </ul>

            <h3 className="text-xs uppercase tracking-wider text-paper/50 mb-2">
              Salons that fit
            </h3>
            {state.result.salons.length > 0 ? (
              <ul className="space-y-2 text-sm" aria-label="Matched salons">
                {state.result.salons.map((salon) => (
                  <li key={salon.id} className="border-b border-line/60 pb-2">
                    <Link
                      href={`/salon/${salon.id}`}
                      className="flex justify-between items-baseline gap-3 hover:text-violet-light focus-ring"
                      aria-label={`${salon.name} in ${salon.area} — offers ${salon.matchedService}`}
                    >
                      <span className="text-paper">{salon.name}</span>
                      <span className="text-paper/50 text-xs shrink-0">{salon.area}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-paper/50">
                No current listings match those categories —{" "}
                <Link href="/discover" className="text-violet-light hover:underline focus-ring">
                  browse all salons
                </Link>.
              </p>
            )}
          </section>

          <p className="sm:col-span-2 text-xs text-paper/40 pt-2 border-t border-line">
            Matched against live GlamConnect AI listings.
          </p>
        </div>
      )}
    </div>
  );
}
