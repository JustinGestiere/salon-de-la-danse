import Link from "next/link";
import type { Metadata } from "next";

import { Alert } from "@/components/ui/alert";
import { Card, CardTitle } from "@/components/ui/card";
import { formatEventDateLong } from "@/lib/format";
import { requireVolunteer } from "@/features/auth/guards";
import { getEditionDays, isRegistrationOpen } from "@/features/editions/queries";
import { countVolunteerAssignments } from "@/features/volunteers/queries";

export const metadata: Metadata = { title: "Tableau de bord — Salon de la Danse" };

export default async function DashboardPage() {
  const { user, edition, volunteer } = await requireVolunteer();
  const [days, assignmentCount] = await Promise.all([
    getEditionDays(edition.id),
    countVolunteerAssignments(volunteer.id),
  ]);

  const registrationOpen = isRegistrationOpen(edition);
  const isLocked = volunteer.planningStatus === "LOCKED";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour {user.firstName} 👋</h1>
        <p className="mt-1 text-gray-600">{edition.name}</p>
      </div>

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
        <CardTitle>Votre participation</CardTitle>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Numéro de badge</dt>
            <dd className="font-mono font-semibold text-gray-900">{volunteer.badgeNumber}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Créneaux réservés</dt>
            <dd className="font-semibold text-gray-900">
              {assignmentCount} / {edition.maxSlotsPerVolunteer}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/planning"
            className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Ouvrir le planning
          </Link>
          <Link
            href="/recapitulatif"
            className="inline-flex min-h-11 items-center rounded-lg border border-brand-200 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Mon récapitulatif
          </Link>
        </div>
      </Card>

      <Card>
        <CardTitle>Dates du Salon</CardTitle>
        {days.length === 0 ? (
          <p className="text-sm text-gray-500">La grille des créneaux sera bientôt publiée.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm text-gray-700">
            {days.map((day) => (
              <li key={day}>• {formatEventDateLong(day)}</li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Règles d'engagement</CardTitle>
        <ul className="flex flex-col gap-1 text-sm text-gray-700">
          <li>• Entre {edition.minSlotsPerVolunteer} et {edition.maxSlotsPerVolunteer} créneaux de 2h.</li>
          <li>• Une seule mission par créneau.</li>
          <li>• Pas plus de {edition.maxConsecutiveSlots} créneaux d'affilée sans pause.</li>
          <li>• Photo d'identité obligatoire pour l'édition du badge.</li>
        </ul>
        {edition.rulesMarkdown ? (
          <p className="mt-3 whitespace-pre-line text-sm text-gray-600">{edition.rulesMarkdown}</p>
        ) : null}
      </Card>

      <Card>
        <CardTitle>Contacts</CardTitle>
        <p className="text-sm text-gray-700">
          {edition.contactEmail ? (
            <>
              E-mail :{" "}
              <a className="text-brand-700" href={`mailto:${edition.contactEmail}`}>
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
  );
}
