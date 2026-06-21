"use client";

import { useEffect, useState, useTransition } from "react";
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
  /** "YYYY-MM-DD" in IST, computed server-side — used as the date input's floor. */
  minDate: string;
}

type Step = "select" | "confirm" | "success";

export function BookingFlow({ salonId, salonName, services, minDate }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("select");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(minDate);
  const [slot, setSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirming, startConfirm] = useTransition();
  const [result, setResult] = useState<{ bookingId: string; reference: string } | null>(null);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;

  useEffect(() => {
    if (!selectedService || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlot(null);

    getAvailableSlots({ salonId, date, durationMinutes: selectedService.durationMinutes })
      .then((openSlots) => {
        if (!cancelled) setSlots(openSlots);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [salonId, date, selectedService]);

  function handleConfirm() {
    if (!selectedService || !slot) return;
    setConfirmError("");
    startConfirm(async () => {
      try {
        const res = await createBooking({
          salonId,
          serviceId: selectedService.id,
          date,
          timeSlot: slot,
        });
        setResult(res);
        setStep("success");
      } catch (err) {
        setConfirmError(err instanceof Error ? err.message : "Something went wrong — please try again.");
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

  if (step === "success" && result) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full match-ring flex items-center justify-center mx-auto">
          <div className="w-11 h-11 rounded-full bg-ink flex items-center justify-center">
            <Check size={22} className="text-violet-light" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-semibold text-paper mt-5">Booking confirmed</h2>
        <p className="text-paper/60 text-sm mt-2">
          {selectedService?.name} at {salonName}
        </p>
        <p className="text-paper/50 text-sm mt-1">
          {date} · {slot}
        </p>
        <div className="glass rounded-xl px-5 py-3 mt-6 inline-block">
          <p className="text-xs uppercase tracking-wider text-paper/50">Booking reference</p>
          <p className="font-display text-lg font-semibold text-paper mt-1">{result.reference}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Button asChild>
            <Link href="/dashboard">View dashboard</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/discover">Browse more salons</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === "confirm" && selectedService && slot) {
    return (
      <div className="glass rounded-2xl p-8 max-w-md mx-auto">
        <p className="text-xs uppercase tracking-wider text-paper/50 mb-1">Confirm your booking</p>
        <h2 className="font-display text-xl font-semibold text-paper">{salonName}</h2>
        <div className="mt-5 space-y-1.5 text-sm">
          <p className="text-paper">{selectedService.name}</p>
          <p className="text-paper/50">
            {date} · {slot} · {selectedService.durationMinutes} min
          </p>
          <p className="font-semibold text-paper pt-1">
            ₹{selectedService.price.toLocaleString("en-IN")}
          </p>
        </div>

        {confirmError && <p className="text-sm text-destructive mt-4">{confirmError}</p>}

        <div className="flex gap-3 mt-7">
          <Button onClick={handleConfirm} disabled={confirming} className="flex-1">
            {confirming ? <Loader2 size={16} className="animate-spin" /> : "Confirm booking"}
          </Button>
          <Button variant="ghost" onClick={() => setStep("select")} disabled={confirming}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section>
        <p className="text-xs uppercase tracking-wider text-paper/50 mb-3">1. Choose a service</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => setServiceId(service.id)}
              aria-pressed={service.id === serviceId}
              className={cn(
                "chip text-left rounded-xl p-4",
                service.id === serviceId && "bg-violet/15 border-violet-light"
              )}
            >
              <p className="text-paper font-medium text-sm">{service.name}</p>
              <p className="text-paper/50 text-xs mt-1">
                {service.durationMinutes} min · ₹{service.price.toLocaleString("en-IN")}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs uppercase tracking-wider text-paper/50 mb-3 flex items-center gap-1.5">
          <Calendar size={13} /> 2. Pick a date
        </p>
        <label htmlFor="booking-date" className="sr-only">Date</label>
        <input
          id="booking-date"
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white/5 border border-line rounded-xl px-4 py-2.5 text-sm text-paper outline-none focus-ring"
        />
      </section>

      <section>
        <p className="text-xs uppercase tracking-wider text-paper/50 mb-3 flex items-center gap-1.5">
          <Clock size={13} /> 3. Pick a time
        </p>
        {slotsLoading ? (
          <p className="text-paper/50 text-sm flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Checking availability…
          </p>
        ) : slots.length === 0 ? (
          <p className="text-paper/50 text-sm">No open slots that day — try another date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                aria-pressed={s === slot}
                className={cn(
                  "chip text-sm px-3.5 py-2 rounded-full",
                  s === slot ? "bg-violet/20 border-violet-light text-paper" : "text-paper/70"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      <Button
        onClick={() => setStep("confirm")}
        disabled={!selectedService || !slot}
        size="lg"
        className="w-full"
      >
        Continue
      </Button>
    </div>
  );
}
