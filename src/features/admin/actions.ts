"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { fail, ok, type ActionResult } from "@/lib/result";
import { resolveAdminContext } from "@/features/admin/guards";
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

  const context = await resolveAdminContext();
  if (!context) return fail("auth.forbidden", "Action réservée à un administrateur.");

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
