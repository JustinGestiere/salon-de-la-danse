import { z } from "zod";

import {
  ACCEPTED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SIZE_MB,
  MIN_PASSWORD_LENGTH,
} from "@/features/auth/constants";

const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, {
    message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  })
  .regex(/[a-z]/, { message: "Ajoutez au moins une lettre minuscule." })
  .regex(/[A-Z]/, { message: "Ajoutez au moins une lettre majuscule." })
  .regex(/[0-9]/, { message: "Ajoutez au moins un chiffre." });

/// Schema partage client/serveur des champs texte de l'inscription. La photo
/// est validee a part car elle transite en tant que File dans un FormData.
export const registerSchema = z
  .object({
    invitationCode: z.string().trim().min(1, { message: "Code d'invitation requis." }),
    firstName: z.string().trim().min(1, { message: "Prénom requis." }).max(80),
    lastName: z.string().trim().min(1, { message: "Nom requis." }).max(80),
    email: z.string().trim().toLowerCase().email({ message: "E-mail invalide." }),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9 +().-]{6,20}$/, { message: "Numéro de téléphone invalide." }),
    birthDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date de naissance invalide." })
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "Vous devez accepter les CGU et la politique de confidentialité.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/// Valide le fichier photo (obligatoire) recu cote serveur.
export const photoSchema = z
  .instanceof(File, { message: "Photo d'identité obligatoire." })
  .refine((file) => file.size > 0, { message: "Photo d'identité obligatoire." })
  .refine((file) => file.size <= MAX_PHOTO_SIZE_BYTES, {
    message: `La photo ne doit pas dépasser ${MAX_PHOTO_SIZE_MB} Mo.`,
  })
  .refine(
    (file) =>
      (ACCEPTED_PHOTO_MIME_TYPES as readonly string[]).includes(file.type),
    { message: "Format accepté : JPEG, PNG ou WebP." },
  );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: "E-mail invalide." }),
  password: z.string().min(1, { message: "Mot de passe requis." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
