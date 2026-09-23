"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/result";
import { ADMIN_FORBIDDEN_MESSAGE } from "@/features/admin/action-helpers";
import { resolveAdminUser } from "@/features/admin/guards";
import {
  ADMIN_THEME_COOKIE,
  ADMIN_THEME_COOKIE_MAX_AGE_SECONDS,
  adminThemeSchema,
  type AdminTheme,
} from "@/features/admin/theme";

/// Mémorise le thème du back-office dans un cookie lu côté serveur : la page
/// arrive déjà dans la bonne palette, sans flash au chargement.
export async function setAdminThemeAction(
  input: unknown,
): Promise<ActionResult<{ theme: AdminTheme }>> {
  const parsed = adminThemeSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Thème inconnu.");

  // Le thème ne dépend d'aucune édition : il doit rester modifiable quand
  // toutes sont archivées.
  const user = await resolveAdminUser();
  if (!user) return fail("auth.forbidden", ADMIN_FORBIDDEN_MESSAGE);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_THEME_COOKIE, parsed.data, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_THEME_COOKIE_MAX_AGE_SECONDS,
  });
  revalidatePath("/admin", "layout");
  return ok({ theme: parsed.data });
}

/// Appelée juste après la connexion depuis la page de la régie. La connexion
/// elle-même passe par Better Auth ; on vérifie ensuite le rôle en base, pour
/// qu'un compte bénévole ne tombe pas sur une page introuvable.
export async function confirmAdminAccessAction(): Promise<ActionResult> {
  const user = await resolveAdminUser();
  if (!user) return fail("auth.forbidden", "Ce compte n'a pas accès à la régie.");
  return ok(undefined);
}
