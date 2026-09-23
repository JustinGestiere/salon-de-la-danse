import "server-only";

import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getSessionUser, type SessionUser } from "@/features/auth/queries";
import { getActiveEdition, type ActiveEdition } from "@/features/editions/queries";

export type AdminContext = {
  user: SessionUser;
  edition: ActiveEdition;
};

/// Le rôle est relu en base plutôt que pris dans la session : le proxy et le
/// cookie ne sont qu'un premier filtre, et un rôle retiré doit prendre effet
/// immédiatement, sans attendre l'expiration de la session.
async function isAdmin(userId: string): Promise<boolean> {
  const record = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return record?.role === "ADMIN";
}

/// Garde des pages du back-office. Un utilisateur connecté mais non
/// administrateur reçoit un 404 plutôt qu'un 403 : l'existence du back-office
/// n'a pas à lui être confirmée.
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  if (!(await isAdmin(user.id))) notFound();

  return { ...user, role: "ADMIN" };
}

/// Administrateur connecté, sans exiger d'édition active : la création d'une
/// édition doit rester possible quand toutes sont archivées.
export async function resolveAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (!(await isAdmin(user.id))) return null;
  return { ...user, role: "ADMIN" };
}

/// Variante pour les Server Actions, qui renvoient un résultat typé et ne
/// redirigent pas. Renvoie null si l'appelant n'est pas administrateur ou si
/// aucune édition n'est active.
export async function resolveAdminContext(): Promise<AdminContext | null> {
  const user = await resolveAdminUser();
  if (!user) return null;

  const edition = await getActiveEdition();
  if (!edition) return null;

  return { user, edition };
}
