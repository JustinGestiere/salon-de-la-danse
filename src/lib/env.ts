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
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variables d'environnement invalides :\n${details}`);
}

export const env = parsed.data;
