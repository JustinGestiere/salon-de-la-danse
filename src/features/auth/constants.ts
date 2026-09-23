/// Regles d'inscription. Aucune valeur magique dispersee dans le code.
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export const ACCEPTED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AcceptedPhotoMimeType = (typeof ACCEPTED_PHOTO_MIME_TYPES)[number];

export function isAcceptedPhotoMimeType(mimeType: string): mimeType is AcceptedPhotoMimeType {
  return ACCEPTED_PHOTO_MIME_TYPES.some((accepted) => accepted === mimeType);
}

/// Tentatives d'inscription autorisées par adresse IP et par fenêtre. Assez
/// large pour quelques erreurs de saisie, assez bas pour empêcher d'essayer
/// des codes d'invitation en série.
export const REGISTRATION_MAX_ATTEMPTS = 10;
export const REGISTRATION_WINDOW_MINUTES = 15;
