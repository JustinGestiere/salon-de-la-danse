import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { ADMIN_LOGIN_PATH } from "@/features/admin/navigation";
import { LOGIN_PATH } from "@/features/auth/redirects";

// En Next 16, l'ex-middleware s'appelle proxy.ts. Avec un dossier src/, il doit
// vivre dans src/ (au même niveau que app/), sinon Next l'ignore. Il ne sert
// que de premier filtre : la présence du cookie de session suffit ici, les
// droits réels sont revérifiés au plus près des données (voir guards.ts).
const PROTECTED_PREFIXES = [
  "/tableau-de-bord",
  "/planning",
  "/recapitulatif",
  "/admin",
];

// La régie a sa propre page de connexion : elle reste accessible sans session
// et reçoit les accès non connectés au back-office.
const ADMIN_PREFIX = "/admin";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected || pathname === ADMIN_LOGIN_PATH) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginPath = pathname.startsWith(ADMIN_PREFIX) ? ADMIN_LOGIN_PATH : LOGIN_PATH;
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("suivant", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tableau-de-bord/:path*",
    "/planning/:path*",
    "/recapitulatif/:path*",
    "/admin/:path*",
  ],
};
