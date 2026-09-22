import "server-only";

import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getSessionUser, type SessionUser } from "@/features/auth/queries";

/// Impose un administrateur sur les routes du back-office.
///
/// Le rôle est relu en base plutôt que pris dans la session : le proxy et le
/// cookie ne sont qu'un premier filtre, et un rôle retiré doit prendre effet
/// immédiatement, sans attendre l'expiration de la session.
///
/// Un utilisateur connecté mais non administrateur reçoit un 404 plutôt qu'un
/// 403 : l'existence du back-office n'a pas à lui être confirmée.
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (record?.role !== "ADMIN") notFound();

  return { ...user, role: "ADMIN" };
}
