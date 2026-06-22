import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSalonProfile } from "@/actions/salons";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getCurrentDateTimeInIST } from "@/lib/booking/slots";
import { BookingFlow } from "@/components/booking/booking-flow";

interface NewBookingPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function NewBookingPage({ params }: NewBookingPageProps) {
  const { salonId } = await params;
  const [salon, user] = await Promise.all([getSalonProfile(salonId), getSessionUser()]);

  if (!salon) notFound();
  // Defense-in-depth, matching the pattern already used on /dashboard and
  // /owner — middleware.ts protects this whole route too, but the page
  // still needs the actual user record (not just "is authenticated").
  if (!user) redirect(`/auth/sign-in?redirect=/booking/${salonId}/new`);

  const { date: minDate } = getCurrentDateTimeInIST();

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-ink">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
        <Link
          href={`/salon/${salon.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/70 hover:text-paper focus-ring"
        >
          <ArrowLeft size={15} /> Back to {salon.name}
        </Link>

        <h1 className="font-display text-3xl font-semibold text-paper mt-4">
          Book at <span className="gradient-text">{salon.name}</span>
        </h1>
        <p className="text-paper/60 mt-2">{salon.area}</p>

        <div className="mt-10">
          <BookingFlow
            salonId={salon.id}
            salonName={salon.name}
            services={salon.services}
            minDate={minDate}
          />
        </div>
      </div>
    </main>
  );
}
