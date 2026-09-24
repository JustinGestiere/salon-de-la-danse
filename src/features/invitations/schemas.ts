import { z } from "zod";

import {
  INVITATION_STATUSES,
  MAX_CODES_PER_BATCH,
} from "@/features/invitations/constants";

const emailSchema = z.string().email();

/// Découpe une liste d'adresses collée depuis le formulaire externe. Exportée
/// pour que le formulaire et la Server Action lisent la saisie à l'identique.
export function splitEmailList(raw: string): string[] {
  const entries = raw
    .split(/[\n,;]/)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
  return [...new Set(entries)];
}

/// Génération d'un lot de codes. Si des adresses sont fournies, un code est
/// créé par adresse et `count` est ignoré ; sinon `count` codes anonymes.
export const generateInvitationsSchema = z
  .object({
    count: z.coerce
      .number({ message: "Indiquez un nombre." })
      .int({ message: "Indiquez un nombre entier." })
      .min(1, { message: "Au moins un code." })
      .max(MAX_CODES_PER_BATCH, {
        message: `Pas plus de ${MAX_CODES_PER_BATCH} codes par lot.`,
      }),
    emails: z.string().trim().max(20000),
    expiresAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date invalide." })
      .or(z.literal("")),
  })
  .superRefine((value, context) => {
    const emails = splitEmailList(value.emails);
    if (emails.length > MAX_CODES_PER_BATCH) {
      context.addIssue({
        code: "custom",
        path: ["emails"],
        message: `Pas plus de ${MAX_CODES_PER_BATCH} adresses par lot.`,
      });
      return;
    }

    const invalid = emails.filter((email) => !emailSchema.safeParse(email).success);
    if (invalid.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["emails"],
        message: `Adresses invalides : ${invalid.slice(0, 3).join(", ")}`,
      });
    }
  });

export type GenerateInvitationsInput = z.infer<typeof generateInvitationsSchema>;
/// Valeurs brutes du formulaire, avant coercition : `count` y est encore la
/// chaîne saisie. React Hook Form a besoin des deux types pour typer zodResolver.
export type GenerateInvitationsFormValues = z.input<typeof generateInvitationsSchema>;

export const deleteInvitationSchema = z.object({
  invitationId: z.string().trim().min(1),
});

export const resendInvitationSchema = z.object({
  invitationId: z.string().trim().min(1),
});

/// Filtres de la liste, lus depuis l'URL : l'état partageable ne vit pas dans
/// un state local.
export const invitationFilterSchema = z.object({
  status: z.enum(INVITATION_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).catch(1),
});

export type InvitationFilter = z.infer<typeof invitationFilterSchema>;
