import { z } from "zod";

import { MAX_SLOT_CAPACITY } from "@/features/planning/admin-schemas";

/// Plafond des quotas : au-delà, le week-end ne compte pas assez de créneaux.
export const MAX_SLOTS_QUOTA = 10;
export const MAX_RULES_LENGTH = 5000;

const localDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: "Date et heure invalides." });
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date invalide." });

export const registrationWindowSchema = z
  .object({
    opensAt: localDateTimeSchema,
    closesAt: localDateTimeSchema,
  })
  .refine((value) => value.closesAt > value.opensAt, {
    message: "La fermeture doit suivre l'ouverture.",
    path: ["closesAt"],
  });

export type RegistrationWindowInput = z.infer<typeof registrationWindowSchema>;

export const registrationLockSchema = z.object({ isLocked: z.boolean() });

const quotaSchema = z.coerce.number().int().min(1).max(MAX_SLOTS_QUOTA);

export const quotasSchema = z
  .object({
    minSlots: quotaSchema,
    maxSlots: quotaSchema,
    maxConsecutive: quotaSchema,
  })
  .refine((value) => value.minSlots <= value.maxSlots, {
    message: "Le minimum ne peut pas dépasser le maximum.",
    path: ["minSlots"],
  });

export type QuotasInput = z.infer<typeof quotasSchema>;

export const welcomeSchema = z.object({
  contactEmail: z.string().trim().toLowerCase().email({ message: "E-mail invalide." }).or(z.literal("")),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[0-9 +().-]{6,20}$/, { message: "Numéro de téléphone invalide." })
    .or(z.literal("")),
  rulesMarkdown: z.string().trim().max(MAX_RULES_LENGTH, { message: `${MAX_RULES_LENGTH} caractères au plus.` }),
});

export type WelcomeInput = z.infer<typeof welcomeSchema>;

export const createMissionSchema = z.object({
  name: z.string().trim().min(2, { message: "Nom requis." }).max(80),
  location: z.string().trim().max(80),
  description: z.string().trim().max(300),
  isSelfBookable: z.boolean(),
  capacity: z.coerce.number().int().min(0).max(MAX_SLOT_CAPACITY),
});

export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type CreateMissionFormValues = z.input<typeof createMissionSchema>;

export const missionAccessSchema = z.object({
  missionId: z.string().trim().min(1),
  isSelfBookable: z.boolean(),
});

export const missionCapacitySchema = z.object({
  missionId: z.string().trim().min(1),
  capacity: z.coerce.number().int().min(0).max(MAX_SLOT_CAPACITY),
});

export const createEditionSchema = z
  .object({
    name: z.string().trim().min(3, { message: "Nom requis." }).max(80),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]{3,60}$/, { message: "Lettres minuscules, chiffres et tirets (3 à 60)." }),
    firstDay: isoDateSchema,
    opensAt: localDateTimeSchema,
    closesAt: localDateTimeSchema,
    copyGrid: z.boolean(),
    copyWelcome: z.boolean(),
    archiveCurrent: z.boolean(),
  })
  .refine((value) => value.closesAt > value.opensAt, {
    message: "La fermeture doit suivre l'ouverture.",
    path: ["closesAt"],
  });

export type CreateEditionInput = z.infer<typeof createEditionSchema>;

export const editionIdSchema = z.object({ editionId: z.string().trim().min(1) });

export const SETTINGS_TABS = ["inscriptions", "missions", "accueil", "editions"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const SETTINGS_TAB_LABELS: Record<SettingsTab, string> = {
  inscriptions: "Inscriptions et règles",
  missions: "Missions et jauges",
  accueil: "Accueil bénévole",
  editions: "Éditions",
};

export const settingsParamsSchema = z.object({
  onglet: z.enum(SETTINGS_TABS).catch("inscriptions"),
});
