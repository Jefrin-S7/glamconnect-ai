"use client";

import { useEffect, useId, useReducer, useTransition } from "react";
import Link from "next/link";
import { Calendar, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAvailableSlots, createBooking } from "@/actions/bookings";
import type { SalonService } from "@/types";

interface BookingFlowProps {
  salonId: string;
  salonName: string;
  services: SalonService[];
  minDate: string;
}

type Step = "select" | "confirm" | "success";

interface State {
  step: Step;
  serviceId: string;
  date: string;
  slot: string | null;
  slots: string[];
  slotsLoading: boolean;
  confirmError: string;
  result: { bookingId: string; reference: string } | null;
}

type Action =
  | { type: "SET_SERVICE"; serviceId: string }
  | { type: "SET_DATE"; date: string }
  | { type: "SET_SLOT"; slot: string }
  | { type: "SLOTS_LOADING" }
  | { type: "SLOTS_LOADED"; slots: string[] }
  | { type: "GO_CONFIRM" }
  | { type: "GO_SELECT" }
  | { type: "CONFIRM_ERROR"; message: string }
  | { type: "SUCCESS"; result: { bookingId: string; reference: string } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SERVICE":
      return { ...state, serviceId: action.serviceId, slot: null, slots: [] };
    case "SET_DATE":
      return { ...state, date: action.date, slot: null, slots: [] };
    case "SET_SLOT":
      return { ...state, slot: action.slot };
    case "SLOTS_LOADING":
      return { ...state, slotsLoading: true, slot: null };
    case "SLOTS_LOADED":
      return { ...state, slotsLoading: false, slots: action.slots };
    case "GO_CONFIRM":
      return { ...state, step: "confirm", confirmError: "" };
    case "GO_SELECT":
      return { ...state, step: "select", confirmError: "" };
    case "CONFIRM_ERROR":
      return { ...state, confirmError: action.message };
    case "SUCCESS":
      return { ...state, step: "success", result: action.result };
    default:
      return state;
  }
}

export function BookingFlow({ salonId, salonName, services, minDate }: BookingFlowProps) {
  const uid = useId();
  const [state, dispatch] = useReducer(reducer, {
    step: "select",
    serviceId: services[0]?.id ?? "",
    date: minDate,
    slot: null,
    slots: [],
    slotsLoading: false,
    confirmError: "",
    result: null,
  });
  const [confirming, startConfirm] = useTransition();
  const selectedService = services.find((s) => s.id === state.serviceId) ?? null;

  // Fetch slots whenever service or date changes
  useEffect(() => {
    if (!selectedService || !state.date) return;
    let cancelled = false;
    dispatch({ type: "SLOTS_LOADING" });
    getAvailableSlots({
      salonId,
      date: state.date,
      durationMinutes: selectedService.durationMinutes,
    }).then((slots) => {
      if (!cancelled) dispatch({ type: "SLOTS_LOADED", slots });
    });
    return () => { cancelled = true; };
  }, [salonId, state.date, selectedService]);

  function handleConfirm() {
    if (!selectedService || !state.slot) return;
    startConfirm(async () => {
      try {
        const res = await createBooking({
          salonId,
          serviceId: selectedService.id,
          date: state.date,
          timeSlot: state.slot!,
        });
        dispatch({ type: "SUCCESS", result: res });
      } catch (err) {
        dispatch({
          type: "CONFIRM_ERROR",
          message: err instanceof Error ? err.message : "Something went wrong — please try again.",
        });
      }
    });
  }

  if (services.length === 0) {
    return (
      <p className="text-paper/60 text-center py-16">
        This salon hasn&apos;t listed any bookable services yet.
      </p>
    );
  }

  /* ── Success ── */
  if (state.step === "success" && state.result) {
    return (
      <section aria-labelledby="success-heading" className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full match-ring flex items-center justify-center mx-auto" aria-hidden="true">
          <div className="w-11 h-11 rounded-full bg-ink flex items-center justify-center">
            <Check size={22} className="text-violet-light" />
          </div>
        </div>
        <h2 id="success-heading" className="font-display text-2xl font-semibold text-paper mt-5">
          Booking confirmed
        </h2>
        <p className="text-paper/60 text-sm mt-2">
          {selectedService?.name} at {salonName}
        </p>
        <p className="text-paper/50 text-sm mt-1">{state.date} · {state.slot}</p>
        <div className="glass rounded-xl px-5 py-3 mt-6 inline-block">
          <p className="text-xs uppercase tracking-wider text-paper/50">Booking reference</p>
          <p className="font-display text-lg font-semibold text-paper mt-1">{state.result.reference}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Button asChild><Link href="/dashboard">View dashboard</Link></Button>
          <Button asChild variant="ghost"><Link href="/discover">Browse more salons</Link></Button>
        </div>
      </section>
    );
  }

  /* ── Confirm step ── */
  if (state.step === "confirm" && selectedService && state.slot) {
    return (
      <section aria-labelledby="confirm-heading" className="glass rounded-2xl p-8 max-w-md mx-auto">
        <h2 id="confirm-heading" className="font-display text-xl font-semibold text-paper">
          Confirm your booking
        </h2>
        <dl className="mt-5 space-y-1 text-sm">
          <div><dt className="sr-only">Salon</dt><dd className="text-paper">{salonName}</dd></div>
          <div><dt className="sr-only">Service</dt><dd className="text-paper">{selectedService.name}</dd></div>
          <div>
            <dt className="sr-only">Date and time</dt>
            <dd className="text-paper/50">{state.date} · {state.slot} · {selectedService.durationMinutes} min</dd>
          </div>
          <div>
            <dt className="sr-only">Price</dt>
            <dd className="font-semibold text-paper pt-1">₹{selectedService.price.toLocaleString("en-IN")}</dd>
          </div>
        </dl>

        {/* aria-live so screen readers announce the error without requiring focus */}
        <div aria-live="polite" aria-atomic="true" className="min-h-[1.5rem] mt-3">
          {state.confirmError && (
            <p role="alert" className="text-sm text-destructive">{state.confirmError}</p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <Button onClick={handleConfirm} disabled={confirming} className="flex-1">
            {confirming && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {confirming ? "Confirming…" : "Confirm booking"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => dispatch({ type: "GO_SELECT" })} disabled={confirming}>
            Back
          </Button>
        </div>
      </section>
    );
  }

  /* ── Select step ── */
  const svcHeadingId = `${uid}-svc-heading`;
  const dateHeadingId = `${uid}-date-heading`;
  const slotHeadingId = `${uid}-slot-heading`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* 1. Service */}
      <section aria-labelledby={svcHeadingId}>
        <h2 id={svcHeadingId} className="text-xs uppercase tracking-wider text-paper/50 mb-3">
          1. Choose a service
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby={svcHeadingId}>
          {services.map((service) => {
            const checked = service.id === state.serviceId;
            return (
              <button
                key={service.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => dispatch({ type: "SET_SERVICE", serviceId: service.id })}
                className={cn(
                  "chip text-left rounded-xl p-4 focus-ring",
                  checked && "bg-violet/15 border-violet-light"
                )}
              >
                <p className="text-paper font-medium text-sm">{service.name}</p>
                <p className="text-paper/50 text-xs mt-1">
                  {service.durationMinutes} min · ₹{service.price.toLocaleString("en-IN")}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Date */}
      <section aria-labelledby={dateHeadingId}>
        <h2 id={dateHeadingId} className="text-xs uppercase tracking-wider text-paper/50 mb-3 flex items-center gap-1.5">
          <Calendar size={13} aria-hidden="true" /> 2. Pick a date
        </h2>
        <label htmlFor={`${uid}-date`} className="sr-only">Appointment date</label>
        <input
          id={`${uid}-date`}
          type="date"
          min={minDate}
          value={state.date}
          onChange={(e) => dispatch({ type: "SET_DATE", date: e.target.value })}
          className="bg-white/5 border border-line rounded-xl px-4 py-2.5 text-sm text-paper outline-none focus-ring w-full sm:w-auto"
        />
      </section>

      {/* 3. Time slot */}
      <section aria-labelledby={slotHeadingId}>
        <h2 id={slotHeadingId} className="text-xs uppercase tracking-wider text-paper/50 mb-3 flex items-center gap-1.5">
          <Clock size={13} aria-hidden="true" /> 3. Pick a time
        </h2>

        {/* aria-live announces slot changes without disrupting reading flow */}
        <div aria-live="polite" aria-atomic="false">
          {state.slotsLoading ? (
            <p className="text-paper/50 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Checking availability…
            </p>
          ) : state.slots.length === 0 ? (
            <p className="text-paper/50 text-sm">No open slots that day — try another date.</p>
          ) : (
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-labelledby={slotHeadingId}
            >
              {state.slots.map((s) => {
                const [h, m] = s.split(":").map(Number);
                const suffix = h >= 12 ? "PM" : "AM";
                const display = `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, "0")} ${suffix}`;
                const checked = s === state.slot;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => dispatch({ type: "SET_SLOT", slot: s })}
                    className={cn(
                      "chip text-sm px-3.5 py-2 rounded-full focus-ring",
                      checked
                        ? "bg-violet/20 border-violet-light text-paper"
                        : "text-paper/70"
                    )}
                  >
                    {display}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Button
        type="button"
        onClick={() => dispatch({ type: "GO_CONFIRM" })}
        disabled={!selectedService || !state.slot}
        size="lg"
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}
