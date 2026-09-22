import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRole } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

/// Lit la session courante. Renvoie null si personne n'est connecte.
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = session.user as unknown as {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

/// Charge la participation du benevole a une edition. Utilise par le dashboard,
/// le planning et le recapitulatif.
export async function getVolunteerForEdition(userId: string, editionId: string) {
  return db.volunteer.findUnique({
    where: { userId_editionId: { userId, editionId } },
    select: {
      id: true,
      badgeNumber: true,
      photoPath: true,
      planningStatus: true,
      lockedAt: true,
      isProfileLocked: true,
      minorApprovedAt: true,
    },
  });
}

/// Un e-mail est-il deja pris ? Sert au controle d'unicite a l'inscription.
export async function isEmailTaken(email: string): Promise<boolean> {
  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return existing !== null;
}
