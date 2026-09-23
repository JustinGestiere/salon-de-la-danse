import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

/// Configuration serveur de Better Auth. C'est la seule source d'auth du
/// projet : aucun hash de mot de passe ni gestion de session faits main.
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // L'inscription est strictement conditionnée au code d'invitation : elle ne
  // passe que par la Server Action registerAction, qui appelle
  // auth.api.signUpEmail côté serveur. La route HTTP publique de Better Auth
  // permettrait de créer un compte sans code, elle est donc désactivée (les
  // appels auth.api.* ne passent pas par ce filtre).
  disabledPaths: ["/sign-up/email"],
  emailAndPassword: {
    enabled: true,
    // La verification d'e-mail se fait par code d'invitation en amont ; on ne
    // bloque donc pas la connexion sur un e-mail non verifie.
    requireEmailVerification: false,
    minPasswordLength: 10,
  },
  user: {
    // Champs metier exposes a Better Auth. Ils vivent sur la table user.
    additionalFields: {
      firstName: { type: "string", required: true, input: true },
      lastName: { type: "string", required: true, input: true },
      phone: { type: "string", required: true, input: true },
      // Le champ `role` est apporté par le plugin admin ci-dessous.
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // rafraichi une fois par jour
  },
  plugins: [
    // Plugin admin officiel : réinitialisation des mots de passe par la régie.
    // Les rôles reprennent l'enum Prisma UserRole au lieu de « admin »/« user ».
    admin({
      defaultRole: "VOLUNTEER",
      adminRoles: ["ADMIN"],
      roles: { ADMIN: adminAc, VOLUNTEER: userAc },
    }),
    // Ecrit les cookies de session depuis les Server Actions. Doit rester le
    // dernier plugin.
    nextCookies(),
  ],
});

export type Auth = typeof auth;
