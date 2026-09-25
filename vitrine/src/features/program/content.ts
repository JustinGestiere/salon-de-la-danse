export type ProgramSpace = {
  id: string;
  name: string;
  location: string;
  description: string;
  access: string;
};

/// Espaces du Salon, d'après le programme 2026 de l'association.
export const PROGRAM_SPACES: readonly ProgramSpace[] = [
  {
    id: "demonstrations",
    name: "Démonstrations",
    location: "Scène principale, niveau -2",
    description: "Près de 100 démonstrations en continu, par des danseurs amateurs et professionnels de tous les styles.",
    access: "Inclus dans le billet",
  },
  {
    id: "initiations",
    name: "Initiations",
    location: "Salle Darty et terrasse, niveau 0",
    description: "Des cours d'essai ouverts à tous, sans niveau requis. Premier arrivé, premier placé.",
    access: "Inclus, sans inscription",
  },
  {
    id: "masterclass",
    name: "Masterclass",
    location: "Salle Grand Angle, niveau +2",
    description: "1h30 avec un invité reconnu au niveau national ou international, puis échange et photos. Arrivez 15 minutes avant.",
    access: "Sur réservation, 90 places au plus",
  },
  {
    id: "conferences",
    name: "Conférences",
    location: "Amphi Jardin, niveau -2",
    description: "Échanges avec des personnalités du monde de la danse.",
    access: "Certaines gratuites (150 places), d'autres sur réservation",
  },
  {
    id: "world-dances",
    name: "Village des danses du monde",
    location: "Au cœur du Salon",
    description: "Mexique, Pérou, Tahiti, Japon, Afrique, Bollywood, Europe de l'Est : les danses d'ailleurs en démonstration.",
    access: "Inclus dans le billet",
  },
  {
    id: "clubbing",
    name: "Espace clubbing",
    location: "Boîte de nuit, niveau -2",
    description: "DJ Roxs aux platines, sur des thèmes musicaux variés.",
    access: "Inclus dans le billet",
  },
  {
    id: "just-dance",
    name: "Just Dance géant",
    location: "Espace café, niveau 0",
    description: "Sur écran géant, animé par la streameuse Weesie.",
    access: "Inclus dans le billet",
  },
  {
    id: "exhibitors",
    name: "Exposants",
    location: "Niveaux 0, -1 et -2",
    description: "Environ 100 associations, écoles, institutions, marques et boutiques.",
    access: "Inclus dans le billet",
  },
];

export const DANCE_FAMILIES = [
  "Classique",
  "Contemporain",
  "Urbain",
  "Jazz",
  "Danses du monde",
  "Danses de salon",
  "Cabaret",
] as const;

/// Les trois façons de vivre le Salon, reprises sur l'accueil.
export const VISIT_MODES = [
  {
    id: "watch",
    title: "Regarder",
    description: "Près de 100 démonstrations en continu sur la scène principale, par des danseurs amateurs et professionnels de tous les styles.",
  },
  {
    id: "try",
    title: "Essayer",
    description: "Des initiations sans inscription, premier arrivé premier placé. Aucun niveau requis, juste l'envie de bouger.",
  },
  {
    id: "train",
    title: "Se dépasser",
    description: "Des masterclass d'1h30 avec des champions et chorégraphes reconnus. 90 places par cours, sur réservation.",
  },
] as const;
