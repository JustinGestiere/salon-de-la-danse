import { z } from "zod";

import { AUDIT_CATEGORIES } from "@/features/audit/constants";

export const auditJournalParamsSchema = z.object({
  categorie: z.enum(AUDIT_CATEGORIES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type AuditJournalParams = z.infer<typeof auditJournalParamsSchema>;
