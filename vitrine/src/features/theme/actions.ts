"use server";

import { cookies } from "next/headers";

import { fail, ok, type ActionResult } from "@/lib/result";
import {
  SITE_THEME_COOKIE,
  SITE_THEME_COOKIE_MAX_AGE_SECONDS,
  siteThemeSchema,
  type SiteTheme,
} from "@/features/theme/theme";

/// Mémorise le thème dans un cookie lu par le layout : la page arrive déjà
/// dans la bonne palette, sans flash au chargement. Préférence d'affichage
/// publique : aucune authentification à vérifier.
export async function setSiteThemeAction(
  input: unknown,
): Promise<ActionResult<{ theme: SiteTheme }>> {
  const parsed = siteThemeSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "Thème inconnu.");

  const cookieStore = await cookies();
  cookieStore.set(SITE_THEME_COOKIE, parsed.data, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SITE_THEME_COOKIE_MAX_AGE_SECONDS,
  });
  return ok({ theme: parsed.data });
}
