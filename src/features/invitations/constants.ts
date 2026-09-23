/// Alphabet sans caractères ambigus (ni O/0, ni I/1) : les codes sont lus et
/// retapés à la main par les bénévoles.
export const INVITATION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITATION_CODE_PREFIX = "INV";
export const INVITATION_CODE_LENGTH = 6;

/// Un lot correspond à une vague d'e-mails envoyée après sélection.
export const MAX_CODES_PER_BATCH = 200;

/// Nombre de tentatives avant d'abandonner la génération d'un lot unique.
export const MAX_CODE_GENERATION_ATTEMPTS = 5;

export const INVITATIONS_PER_PAGE = 25;

export const INVITATION_STATUSES = ["available", "used", "expired"] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  available: "Disponible",
  used: "Utilisé",
  expired: "Expiré",
};
