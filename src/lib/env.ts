import "server-only";

import { z } from "zod";

/// Toutes les variables d'environnement serveur sont validees ici, au premier
/// import. Une variable manquante fait echouer le demarrage plutot que de
/// laisser une erreur surgir a l'execution. Aucun process.env.X ailleurs.
/// Longueur d'un secret généré sur 32 octets aléatoires, une fois encodé.
const MIN_AUTH_SECRET_LENGTH = 32;

/// Valeur d'exemple de .env.example : copiée telle quelle, elle permettrait à
/// n'importe qui de forger des cookies de session.
const PLACEHOLDER_AUTH_SECRET = "change-me-in-production";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(MIN_AUTH_SECRET_LENGTH, {
      message: `doit contenir au moins ${MIN_AUTH_SECRET_LENGTH} caractères aléatoires`,
    })
    .refine((secret) => secret !== PLACEHOLDER_AUTH_SECRET, {
      message: "valeur d'exemple de .env.example, générez un vrai secret",
    }),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  UPLOAD_DIR: z.string().min(1),
  // Envoi des e-mails (réinitialisation du mot de passe). Facultatif en
  // développement, où la page de demande prévient que l'envoi est indisponible.
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  MAIL_FROM: z.string().min(1).optional(),
});

/// En production, un bénévole qui a perdu son mot de passe doit pouvoir le
/// réinitialiser seul : l'envoi d'e-mails devient obligatoire.
const MAIL_VARIABLES = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "MAIL_FROM"] as const;

const envSchema = serverEnvSchema.superRefine((value, context) => {
  if (value.NODE_ENV !== "production") return;
  for (const name of MAIL_VARIABLES) {
    if (!value[name]) {
      context.addIssue({ code: "custom", path: [name], message: "obligatoire en production" });
    }
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variables d'environnement invalides :\n${details}`);
}

export const env = parsed.data;
