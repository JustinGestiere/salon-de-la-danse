/// Journée type du salon (heure de Paris) : 5 créneaux, le premier plus court.
/// Sert quand une édition est créée sans reprendre la grille d'une autre.
export const DEFAULT_DAILY_SLOTS: readonly { position: number; startsAt: string; endsAt: string }[] = [
  { position: 1, startsAt: "08:30", endsAt: "10:00" },
  { position: 2, startsAt: "10:00", endsAt: "12:00" },
  { position: 3, startsAt: "12:00", endsAt: "14:00" },
  { position: 4, startsAt: "14:00", endsAt: "16:00" },
  { position: 5, startsAt: "16:00", endsAt: "18:00" },
];

/// Le salon dure trois jours (vendredi, samedi, dimanche).
export const DEFAULT_EVENT_DAY_COUNT = 3;

/// Nom proposé pour une toute première édition, l'année est ajoutée à la suite.
export const DEFAULT_EDITION_NAME = "Salon de la Danse";
