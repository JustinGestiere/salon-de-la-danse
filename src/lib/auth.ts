import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { env } from "@/lib/env";

/// Configuration serveur de Better Auth. C'est la seule source d'auth du
/// projet : aucun hash de mot de passe ni gestion de session faits main.
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Routes HTTP publiques de Better Auth coupées (les appels auth.api.* côté
  // serveur ne passent pas par ce filtre) :
  // - /sign-up/email : l'inscription est strictement conditionnée au code
  //   d'invitation et ne passe que par la Server Action registerAction ;
  // - /update-user : une fois validées, les informations personnelles ne sont
  //   modifiables que par un administrateur (cahier des charges).
  disabledPaths: ["/sign-up/email", "/update-user"],
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
      role: { type: "string", required: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // rafraichi une fois par jour
  },
  // Ecrit les cookies de session depuis les Server Actions.
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
