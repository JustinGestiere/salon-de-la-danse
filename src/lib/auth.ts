import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "@/features/auth/constants";
import { sendPasswordResetEmail } from "@/features/auth/password-reset-mailer";

const SECONDS_PER_MINUTE = 60;

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
  //   modifiables que par un administrateur (cahier des charges) ;
  // - /request-password-reset et /reset-password : le mot de passe oublié passe
  //   par des Server Actions, qui limitent les tentatives et imposent les mêmes
  //   règles de mot de passe qu'à l'inscription.
  disabledPaths: ["/sign-up/email", "/update-user", "/request-password-reset", "/reset-password"],
  emailAndPassword: {
    enabled: true,
    // La verification d'e-mail se fait par code d'invitation en amont ; on ne
    // bloque donc pas la connexion sur un e-mail non verifie.
    requireEmailVerification: false,
    minPasswordLength: 10,
    resetPasswordTokenExpiresIn: PASSWORD_RESET_TOKEN_TTL_MINUTES * SECONDS_PER_MINUTE,
    // Un mot de passe réinitialisé ferme les sessions ouvertes ailleurs, au cas
    // où quelqu'un d'autre se serait servi de l'ancien.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetEmail({ userId: user.id, email: user.email, token });
    },
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
