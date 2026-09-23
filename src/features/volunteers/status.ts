/// Âge de la majorité : en dessous, la participation doit être validée par un
/// administrateur (voir Volunteer.minorApprovedAt).
export const ADULT_AGE = 18;

/// Âge atteint à une date donnée. Les dates de naissance sont stockées en date
/// seule (minuit UTC) : on compare donc les champs UTC.
export function computeAgeOn(birthDate: Date, referenceDate: Date): number {
  const age = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasHadBirthday =
    referenceDate.getUTCMonth() > birthDate.getUTCMonth() ||
    (referenceDate.getUTCMonth() === birthDate.getUTCMonth() &&
      referenceDate.getUTCDate() >= birthDate.getUTCDate());
  return hasHadBirthday ? age : age - 1;
}

export function isMinorOn(birthDate: Date, referenceDate: Date): boolean {
  return computeAgeOn(birthDate, referenceDate) < ADULT_AGE;
}

/// Toute personne née après cette date sera mineure le jour de référence. Sert
/// à filtrer les profils mineurs directement en base.
export function computeMinorBirthDateCutoff(referenceDate: Date): Date {
  const cutoff = new Date(referenceDate);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - ADULT_AGE);
  return cutoff;
}

/// État d'un bénévole vu par la régie : le statut du planning ne suffit pas,
/// un brouillon vide et un brouillon rempli n'appellent pas la même relance.
export const VOLUNTEER_STATUSES = ["locked", "draft", "empty"] as const;
export type VolunteerStatus = (typeof VOLUNTEER_STATUSES)[number];

export const VOLUNTEER_STATUS_LABELS: Record<VolunteerStatus, string> = {
  locked: "Planning validé",
  draft: "Brouillon",
  empty: "Aucun créneau",
};

export function deriveVolunteerStatus(
  planningStatus: "DRAFT" | "LOCKED",
  assignmentCount: number,
): VolunteerStatus {
  if (planningStatus === "LOCKED") return "locked";
  return assignmentCount > 0 ? "draft" : "empty";
}
