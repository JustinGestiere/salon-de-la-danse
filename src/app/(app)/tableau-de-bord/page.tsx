import Link from "next/link";
import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { formatEventDateLong } from "@/lib/format";
import { requireVolunteer } from "@/features/auth/guards";
import { getEditionDays, isRegistrationOpen } from "@/features/editions/queries";
import { countVolunteerAssignments } from "@/features/volunteers/queries";

export const metadata: Metadata = { title: "Tableau de bord — Salon de la Danse" };

const PRIMARY_LINK_CLASS =
  "bg-sunset inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-on-accent shadow-[0_10px_30px_var(--admin-glow)] transition hover:brightness-105";
const SECONDARY_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-medium text-ink transition hover:bg-raised";

export default async function DashboardPage() {
  const { user, edition, volunteer } = await requireVolunteer();
  const [days, assignmentCount] = await Promise.all([
    getEditionDays(edition.id),
    countVolunteerAssignments(volunteer.id),
  ]);

  const registrationOpen = isRegistrationOpen(edition);
  const isLocked = volunteer.planningStatus === "LOCKED";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader kicker={edition.name} title={`Bonjour ${user.firstName},`} emphasis="en scène !" />

      {isLocked ? (
        <Alert tone="success">
          Votre planning est <strong>validé et verrouillé</strong>. Pour toute modification,
          contactez l'équipe organisatrice.
        </Alert>
      ) : registrationOpen ? (
        <Alert tone="info">
          Les inscriptions sont <strong>ouvertes</strong> : vous pouvez composer et modifier
          votre planning jusqu'à sa validation.
        </Alert>
      ) : (
        <Alert tone="warning">
          Les inscriptions sont actuellement <strong>fermées</strong>. Votre planning reste
          consultable.
        </Alert>
      )}

      <Card>
        <CardTitle icon="contact-card">Votre participation</CardTitle>
        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-raised px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-subtle">Badge</dt>
            <dd className="mt-1 font-code text-xl text-ink">{volunteer.badgeNumber}</dd>
          </div>
          <div className="rounded-2xl bg-raised px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-subtle">Créneaux réservés</dt>
            <dd className="mt-1 font-display text-3xl leading-none text-ink">
              {assignmentCount}
              <span className="text-lg text-muted"> / {edition.maxSlotsPerVolunteer}</span>
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/planning" className={PRIMARY_LINK_CLASS}>
            Ouvrir le planning
          </Link>
          <Link href="/recapitulatif" className={SECONDARY_LINK_CLASS}>
            Mon récapitulatif
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardTitle icon="calendar">Dates du Salon</CardTitle>
          {days.length === 0 ? (
            <p className="text-sm text-muted">La grille des créneaux sera bientôt publiée.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              {days.map((day) => (
                <li key={day} className="flex items-center gap-2 capitalize">
                  <span aria-hidden="true" className="bg-sunset size-1.5 rounded-full" />
                  {formatEventDateLong(day)}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle icon="book-contacts">Contacts</CardTitle>
          <p className="text-sm leading-relaxed text-ink-soft">
            {edition.contactEmail ? (
              <>
                E-mail :{" "}
                <a
                  className="text-accent underline-offset-4 hover:underline"
                  href={`mailto:${edition.contactEmail}`}
                >
                  {edition.contactEmail}
                </a>
                <br />
              </>
            ) : null}
            {edition.contactPhone ? <>Téléphone : {edition.contactPhone}</> : null}
            {!edition.contactEmail && !edition.contactPhone ? "Coordonnées à venir." : null}
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle icon="text-bullet-list-square">Règles d'engagement</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-ink-soft marker:text-subtle">
          <li>Entre {edition.minSlotsPerVolunteer} et {edition.maxSlotsPerVolunteer} créneaux de 2h.</li>
          <li>Une seule mission par créneau.</li>
          <li>Pas plus de {edition.maxConsecutiveSlots} créneaux d'affilée sans pause.</li>
          <li>Photo d'identité obligatoire pour l'édition du badge.</li>
        </ul>
        {edition.rulesMarkdown ? (
          <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm text-muted">
            {edition.rulesMarkdown}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
