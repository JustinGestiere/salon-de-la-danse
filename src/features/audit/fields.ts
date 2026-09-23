import type { AuditDiff } from "@/features/audit/describe";

/// Libellés des champs tracés dans `changes.before` / `changes.after`. Un champ
/// absent de la liste s'affiche sous son nom technique plutôt que de disparaître.
const AUDIT_FIELD_LABELS: Record<string, string> = {
  firstName: "Prénom",
  lastName: "Nom",
  email: "E-mail",
  phone: "Téléphone",
  birthDate: "Date de naissance",
  planningStatus: "Planning",
  capacity: "Jauge",
  isOpen: "Case ouverte",
  isSelfBookable: "Réservable librement",
  opensAt: "Ouverture",
  closesAt: "Fermeture",
  isRegistrationLocked: "Inscriptions verrouillées",
  minSlots: "Créneaux minimum",
  maxSlots: "Créneaux maximum",
  maxConsecutive: "À la suite, au plus",
  contactEmail: "E-mail de l'équipe",
  contactPhone: "Téléphone de l'équipe",
  rulesChanged: "Règles modifiées",
  copiedFrom: "Grille reprise de",
};

const PLANNING_STATUS_LABELS: Record<string, string> = {
  LOCKED: "Validé",
  DRAFT: "Brouillon",
};

export type AuditDiffView = {
  label: string;
  before: string | null;
  after: string | null;
};

function formatValue(field: string, value: string | null): string | null {
  if (value === null) return null;
  if (field === "planningStatus") return PLANNING_STATUS_LABELS[value] ?? value;
  return value;
}

export function toAuditDiffView(diff: AuditDiff): AuditDiffView {
  return {
    label: AUDIT_FIELD_LABELS[diff.field] ?? diff.field,
    before: formatValue(diff.field, diff.before),
    after: formatValue(diff.field, diff.after),
  };
}
