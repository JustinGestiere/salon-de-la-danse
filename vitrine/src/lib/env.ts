import "server-only";

import { z } from "zod";

/// Variables d'environnement serveur, validées au premier import : une valeur
/// invalide fait échouer le démarrage plutôt que d'éclater en plein paiement.
/// Aucun process.env.X ailleurs.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SITE_URL: z.url().default("http://localhost:3001"),
  // Facultative : sans clé, le site reste consultable et la billetterie
  // annonce que le paiement en ligne est indisponible.
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variables d'environnement invalides :\n${details}`);
}

export const env = parsed.data;
