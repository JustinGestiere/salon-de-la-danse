import type { Guest } from "@/features/guests/content";

type GuestNameListProps = {
  guests: readonly Guest[];
};

/// Liste typographique, sans photo : deux colonnes sur grand écran.
export function GuestNameList({ guests }: GuestNameListProps) {
  return (
    <ul className="grid border-t border-line-strong lg:grid-cols-2 lg:gap-x-16 lg:border-t-0">
      {guests.map((guest) => (
        <li
          key={guest.id}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-5 lg:[&:nth-child(-n+2)]:border-t lg:[&:nth-child(-n+2)]:border-t-line-strong"
        >
          <span className="font-display text-3xl leading-tight text-ink sm:text-[34px]">{guest.names}</span>
          <span className="text-sm text-muted">{guest.discipline}</span>
        </li>
      ))}
    </ul>
  );
}
