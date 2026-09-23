import Link from "next/link";

import { formatEventDateLong } from "@/lib/format";
import { buildQueryHref, type QueryParams } from "@/lib/url";

export type DayTab = {
  eventDate: string;
  fillRate: number;
};

type DayTabsProps = {
  days: readonly DayTab[];
  activeDay: string;
  params: QueryParams;
};

/// Onglets de journée, sous forme de liens : le jour affiché vit dans l'URL.
export function DayTabs({ days, activeDay, params }: DayTabsProps) {
  return (
    <nav aria-label="Jour du salon" className="flex flex-wrap gap-2">
      {days.map((day) => {
        const isActive = day.eventDate === activeDay;
        const [weekday = "", dayNumber = ""] = formatEventDateLong(day.eventDate).split(" ");
        return (
          <Link
            key={day.eventDate}
            href={buildQueryHref("/admin/planning", params, { jour: day.eventDate, case: undefined, recherche: undefined })}
            aria-current={isActive ? "page" : undefined}
            scroll={false}
            className={`flex w-40 flex-col gap-1.5 rounded-2xl border px-4 py-3 transition ${
              isActive ? "border-accent bg-raised" : "border-line hover:border-line-strong"
            }`}
          >
            <span className="flex items-baseline gap-2">
              <span className={`font-display text-3xl leading-none ${isActive ? "text-accent-strong" : "text-ink"}`}>{dayNumber}</span>
              <span className="text-sm capitalize text-ink-soft">{weekday}</span>
            </span>
            <span aria-hidden="true" className="h-[3px] w-full rounded-full bg-line">
              <span
                style={{ width: `${day.fillRate}%` }}
                className={`block h-[3px] rounded-full ${isActive ? "bg-sunset" : "bg-subtle"}`}
              />
            </span>
            <span className="text-xs text-subtle">{day.fillRate} % pourvu</span>
          </Link>
        );
      })}
    </nav>
  );
}
