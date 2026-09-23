import type { BadgeHolder } from "@/features/badges/queries";
import { buildVerificationUrl } from "@/features/badges/urls";
import { QrCode } from "@/features/badges/components/qr-code";
import { VolunteerPhoto } from "@/features/badges/components/volunteer-photo";

type BadgeCardProps = {
  holder: BadgeHolder;
  /// Mention en haut à droite : le mois du salon, ou le nom de l'édition tant
  /// que la grille n'est pas créée.
  eventLabel: string;
};

/// Badge de 105 × 74 mm : photo, prénom, nom, rôle, identifiant unique et QR
/// code de vérification (cahier des charges, « Badging »).
export function BadgeCard({ holder, eventLabel }: BadgeCardProps) {
  const fullName = `${holder.firstName} ${holder.lastName}`;

  return (
    <article className="flex h-[74mm] w-[105mm] flex-col overflow-hidden admin-badge bg-[var(--badge-paper)] text-[var(--badge-ink)] outline-1 -outline-offset-[0.5px] outline-dashed outline-[var(--badge-cut)]">
      <div aria-hidden="true" className="h-[1.6mm] shrink-0 bg-sunset" />
      <div className="flex items-baseline justify-between px-[5mm] pt-[3mm]">
        <span className="font-display text-[15pt] leading-none">
          Salon de la <em>Danse</em>
        </span>
        <span className="text-[6.5pt] font-semibold uppercase tracking-[0.2em] text-[var(--badge-muted)]">{eventLabel}</span>
      </div>
      <div className="flex flex-1 items-center gap-[4mm] px-[5mm]">
        <div className="relative h-[30mm] w-[23mm] shrink-0 overflow-hidden rounded-[3mm] bg-[var(--badge-photo)]">
          {holder.hasPhoto ? (
            <VolunteerPhoto volunteerId={holder.id} fullName={fullName} sizes="23mm" />
          ) : (
            <span className="grid h-full place-items-center text-center text-[7pt] font-medium text-[var(--badge-alert)]">Photo manquante</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[1mm]">
          <span className="truncate font-display text-[24pt] leading-none">{holder.firstName}</span>
          <span className="truncate text-[9pt] font-semibold uppercase tracking-[0.16em] text-[var(--badge-ink-soft)]">{holder.lastName}</span>
        </div>
        <QrCode value={buildVerificationUrl(holder.id)} label={`QR code de vérification de ${fullName}`} className="size-[22mm] shrink-0" />
      </div>
      <div className="flex h-[11mm] shrink-0 items-center justify-between bg-sunset px-[5mm] text-[var(--badge-ink)]">
        <span className="text-[12pt] font-bold tracking-[0.32em]">BÉNÉVOLE</span>
        <span className="font-code text-[9pt] font-medium">{holder.badgeNumber}</span>
      </div>
    </article>
  );
}
