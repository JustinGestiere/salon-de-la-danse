import { formatDate } from "@/lib/format";
import type { RegistrationTimeline as Timeline } from "@/features/editions/timeline";

type RegistrationTimelineProps = {
  timeline: Timeline;
  opensAt: Date;
  closesAt: Date;
  eventStart: Date | null;
  isLocked: boolean;
};

/// En deçà ou au-delà, un libellé centré sur son repère déborderait de la frise :
/// on l'aligne alors sur le bord.
const EDGE_LABEL_PERCENT = 15;

function labelAlignment(percent: number): string {
  if (percent < EDGE_LABEL_PERCENT) return "translate-x-0 items-start";
  if (percent > 100 - EDGE_LABEL_PERCENT) return "-translate-x-full items-end";
  return "-translate-x-1/2 items-center";
}

/// Frise de la fenêtre d'inscription, d'aujourd'hui au lever de rideau. Le
/// dessin est décoratif : les dates sont données en texte juste en dessous.
export function RegistrationTimeline({ timeline, opensAt, closesAt, eventStart, isLocked }: RegistrationTimelineProps) {
  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden="true" className="relative h-14">
        <div className="absolute inset-x-0 top-3 h-px bg-line-strong" />
        <div
          style={{ left: `${timeline.opensPercent}%`, width: `${Math.max(timeline.closesPercent - timeline.opensPercent, 1)}%` }}
          className={`absolute top-[9px] h-[7px] rounded-full ${
            isLocked ? "bg-[repeating-linear-gradient(135deg,var(--admin-danger)_0_3px,transparent_3px_7px)]" : "bg-sunset"
          }`}
        />
        <span style={{ left: `${timeline.todayPercent}%` }} className={`absolute top-[7px] flex flex-col gap-2 ${labelAlignment(timeline.todayPercent)}`}>
          <span className="size-[11px] rounded-full bg-ink shadow-[0_0_0_4px_var(--admin-line)]" />
          <span className="whitespace-nowrap text-xs text-ink-soft">Aujourd'hui</span>
        </span>
        {eventStart ? (
          <span style={{ left: `${timeline.eventPercent}%` }} className={`absolute top-[5px] flex flex-col gap-1.5 ${labelAlignment(timeline.eventPercent)}`}>
            <span className="size-[15px] rotate-45 rounded-[3px] bg-accent" />
            <span className="whitespace-nowrap font-display text-lg italic text-accent-strong">Lever de rideau</span>
          </span>
        ) : null}
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="text-subtle">Ouverture</dt>
          <dd className="font-medium text-ink">{formatDate(opensAt)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-subtle">Fermeture</dt>
          <dd className="font-medium text-ink">{formatDate(closesAt)}</dd>
        </div>
        {eventStart ? (
          <div className="flex gap-2">
            <dt className="text-subtle">Salon</dt>
            <dd className="font-medium text-ink">{formatDate(eventStart)}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
