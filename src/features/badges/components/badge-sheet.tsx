import type { BadgeHolder } from "@/features/badges/queries";
import { BadgeCard } from "@/features/badges/components/badge-card";

type BadgeSheetProps = {
  holders: readonly BadgeHolder[];
  eventLabel: string;
  label: string;
};

/// Une page A4 de 8 badges, à la taille réelle. La classe admin-badge-sheet
/// porte la mise en page d'impression (voir globals.css).
export function BadgeSheet({ holders, eventLabel, label }: BadgeSheetProps) {
  return (
    <section
      aria-label={label}
      className="admin-badge admin-badge-sheet grid h-[297mm] w-[210mm] shrink-0 grid-cols-[repeat(2,105mm)] grid-rows-[repeat(4,74mm)] content-start bg-[var(--badge-paper)] shadow-[0_30px_80px_rgb(0_0_0/0.35)] print:shadow-none"
    >
      {holders.map((holder) => (
        <BadgeCard key={holder.id} holder={holder} eventLabel={eventLabel} />
      ))}
    </section>
  );
}
