import "server-only";

import { db } from "@/lib/db";
import { computeMinorBirthDateCutoff } from "@/features/volunteers/status";

export type AdminOverview = {
  volunteerCount: number;
  lockedPlanningCount: number;
  draftWithSlotsCount: number;
  emptyPlanningCount: number;
  invitationCount: number;
  invitationUsedCount: number;
  /// Codes encore utilisables : ni consommés, ni expirés.
  invitationAvailableCount: number;
  missingPhotoCount: number;
  pendingMinorCount: number;
};

/// Compteurs temps réel de la vue d'ensemble. `eventStartsAt` sert à repérer les
/// profils mineurs le jour du salon ; sans grille, aucun n'est compté.
export async function getAdminOverview(
  editionId: string,
  eventStartsAt: Date | null,
): Promise<AdminOverview> {
  const now = new Date();
  const [
    volunteerCount,
    lockedPlanningCount,
    emptyPlanningCount,
    invitationCount,
    invitationUsedCount,
    invitationAvailableCount,
    missingPhotoCount,
    pendingMinorCount,
  ] = await Promise.all([
    db.volunteer.count({ where: { editionId } }),
    db.volunteer.count({ where: { editionId, planningStatus: "LOCKED" } }),
    db.volunteer.count({ where: { editionId, planningStatus: "DRAFT", assignments: { none: {} } } }),
    db.invitationCode.count({ where: { editionId } }),
    db.invitationCode.count({ where: { editionId, usedAt: { not: null } } }),
    db.invitationCode.count({
      where: { editionId, usedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    }),
    db.volunteer.count({ where: { editionId, photoPath: null } }),
    eventStartsAt
      ? db.volunteer.count({
          where: {
            editionId,
            minorApprovedAt: null,
            user: { birthDate: { gt: computeMinorBirthDateCutoff(eventStartsAt) } },
          },
        })
      : Promise.resolve(0),
  ]);

  return {
    volunteerCount,
    lockedPlanningCount,
    draftWithSlotsCount: volunteerCount - lockedPlanningCount - emptyPlanningCount,
    emptyPlanningCount,
    invitationCount,
    invitationUsedCount,
    invitationAvailableCount,
    missingPhotoCount,
    pendingMinorCount,
  };
}
