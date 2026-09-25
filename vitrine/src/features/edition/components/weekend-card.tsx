import Link from "next/link";

import { EDITION_DAYS } from "@/features/edition/content";

type WeekendCardProps = {
  showHours?: boolean;
  linkHref?: string;
  linkLabel?: string;
};

/// Les trois jours de l'édition, en liste.
export function WeekendCard({ showHours = false, linkHref, linkLabel }: WeekendCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-line bg-surface p-8 sm:p-10">
      <h3 className="font-display text-4xl leading-none text-ink">Le week-end</h3>
      <ul className="flex flex-col">
        {EDITION_DAYS.map((day) => (
          <li key={day.isoDate} className="flex flex-col gap-1 border-b border-line py-4 last:border-b-0">
            <span className="flex flex-wrap justify-between gap-x-4 font-semibold text-ink">
              {day.label}
              {showHours ? <span className="font-normal text-muted">{day.hours}</span> : null}
            </span>
            <span className="text-sm text-muted">{day.title}. {day.summary}</span>
          </li>
        ))}
      </ul>
      {linkHref && linkLabel ? (
        <Link href={linkHref} className="mt-auto text-[15px] font-medium text-accent hover:underline">
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}
