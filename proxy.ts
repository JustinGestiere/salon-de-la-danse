import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// En Next 16, l'ex-middleware s'appelle proxy.ts. Il ne sert que de premier
// filtre : la présence du cookie de session suffit ici, les droits réels sont
// revérifiés au plus près des données dans chaque page (voir guards.ts).
const PROTECTED_PREFIXES = [
  "/tableau-de-bord",
  "/planning",
  "/recapitulatif",
  "/admin",
];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtected) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/connexion", request.url);
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
