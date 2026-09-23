import "server-only";

import { redirect } from "next/navigation";

import {
  getSessionUser,
  getVolunteerForEdition,
  type SessionUser,
  type VolunteerParticipation,
} from "@/features/auth/queries";
import { getActiveEdition, type ActiveEdition } from "@/features/editions/queries";
import { ADMIN_HOME_PATH } from "@/features/auth/redirects";

/// Impose une session. Redirige vers la connexion sinon. Utilisé par les pages
/// de l'espace bénévole (barrière au plus près des données, pas seulement dans
/// le proxy).
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  return user;
}

export type VolunteerSession = {
  user: SessionUser;
  edition: ActiveEdition;
  volunteer: VolunteerParticipation;
};

/// Impose une participation bénévole à l'édition active.
export async function requireVolunteer(): Promise<VolunteerSession> {
  const user = await requireSessionUser();
  const edition = await getActiveEdition();
  if (!edition) redirect("/connexion");

  const volunteer = await getVolunteerForEdition(user.id, edition.id);
  if (!volunteer) redirect(user.role === "ADMIN" ? ADMIN_HOME_PATH : "/connexion");

  return { user, edition, volunteer };
}
