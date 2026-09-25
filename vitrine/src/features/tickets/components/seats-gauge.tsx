import { formatCount } from "@/lib/format";
import type { SeatAvailability } from "@/features/tickets/quotas";

type SeatsGaugeProps = {
  availability: SeatAvailability;
};

function describeAvailability({ capacity, isLow, isSoldOut }: SeatAvailability): string {
  if (isSoldOut) return "Plus de billets en ligne";
  if (isLow) return "Dernières places, samedi et dimanche";
  return `sur ${formatCount(capacity)}, samedi et dimanche`;
}

/// Places restantes pour le Salon, avec une jauge des billets vendus.
export function SeatsGauge({ availability }: SeatsGaugeProps) {
  const seatsSold = availability.capacity - availability.seatsLeft;
  const soldPercent = Math.round((seatsSold / availability.capacity) * 100);
  const isAlert = availability.isLow || availability.isSoldOut;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted">Places disponibles</span>
      <span className={`font-display text-6xl leading-[0.9] sm:text-7xl ${isAlert ? "text-warn" : "text-ink"}`}>
        {availability.isSoldOut ? "Complet" : formatCount(availability.seatsLeft)}
      </span>
      <div
        role="meter"
        aria-label="Places vendues"
        aria-valuemin={0}
        aria-valuemax={availability.capacity}
        aria-valuenow={seatsSold}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-strong"
      >
        <div className="bg-sunset h-full rounded-full" style={{ width: `${soldPercent}%` }} />
      </div>
      <span className="text-[13px] text-muted">{describeAvailability(availability)}</span>
    </div>
  );
}
