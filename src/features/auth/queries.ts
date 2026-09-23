import "server-only";

import { headers } from "next/headers";
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/// Forme attendue de l'utilisateur porté par la session Better Auth. Les
/// champs métier viennent des additionalFields : la librairie les type en
/// `string`, on les revalide donc ici plutôt que de les forcer avec un cast.
/// Les valeurs de `role` reflètent l'enum Prisma UserRole.
const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  /// Le rôle n'est pas modifiable à l'inscription (input: false côté Better
  /// Auth). En cas de valeur inattendue, on retombe sur le rôle le moins
  /// privilégié plutôt que de déconnecter l'utilisateur.
  role: z.enum(["ADMIN", "VOLUNTEER"]).catch("VOLUNTEER"),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

/// Lit la session courante. Renvoie null si personne n'est connecte.
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const parsed = sessionUserSchema.safeParse(session.user);
  if (!parsed.success) {
    console.error("[getSessionUser] session incomplète", parsed.error.issues);
    return null;
  }

  return parsed.data;
}

const volunteerParticipationSelect = {
  id: true,
  badgeNumber: true,
  photoPath: true,
  planningStatus: true,
  lockedAt: true,
  isProfileLocked: true,
  minorApprovedAt: true,
} satisfies Prisma.VolunteerSelect;

export type VolunteerParticipation = Prisma.VolunteerGetPayload<{
  select: typeof volunteerParticipationSelect;
}>;

/// Charge la participation du benevole a une edition. Utilise par le dashboard,
/// le planning et le recapitulatif.
export async function getVolunteerForEdition(
  userId: string,
  editionId: string,
): Promise<VolunteerParticipation | null> {
  return db.volunteer.findUnique({
    where: { userId_editionId: { userId, editionId } },
    select: volunteerParticipationSelect,
  });
}
