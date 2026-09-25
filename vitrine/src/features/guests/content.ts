export type GuestPhoto = {
  src: string;
  alt: string;
  /// Cadrage de la photo dans sa vignette (object-position).
  focus: "top" | "center";
};

export type Guest = {
  id: string;
  names: string;
  discipline: string;
  bio: string;
  photo: GuestPhoto | null;
};

/// Invités de l'édition 2026, d'après le site de l'association. Les invités
/// 2027 ne sont pas encore annoncés.
export const GUESTS_EDITION_YEAR = 2026;

export const GUESTS: readonly Guest[] = [
  {
    id: "chris-marques-jaclyn-spencer",
    names: "Chris Marques & Jaclyn Spencer",
    discipline: "Latine, standard",
    bio: "Trois fois champion du monde entre 2004 et 2006, juré de Danse avec les Stars. Jaclyn Spencer, championne du monde de danse standard, cofonde avec lui la troupe Alors On Danse.",
    photo: { src: "/images/guests/chris-marques-jaclyn-spencer.webp", alt: "Chris Marques et Jaclyn Spencer", focus: "center" },
  },
  {
    id: "jordan-mouillerac",
    names: "Jordan Mouillerac",
    discipline: "Latines, salon",
    bio: "Danseur, chorégraphe et professeur. Champion de France de salsa en 2013 et 2017, vainqueur de la saison 14 de Danse avec les Stars en 2025.",
    photo: { src: "/images/guests/jordan-mouillerac.webp", alt: "Jordan Mouillerac", focus: "top" },
  },
  {
    id: "romain-guillermic-fauve-hautot",
    names: "Romain Guillermic & Fauve Hautot",
    discipline: "Électro, latine",
    bio: "Champion de France d'électro en 2008 et champion du monde en solo en 2017, Romain Guillermic fonde avec Fauve Hautot, plusieurs fois championne de France de danses latines, la compagnie Same But Different.",
    photo: { src: "/images/guests/romain-guillermic-fauve-hautot.webp", alt: "Romain Guillermic et Fauve Hautot", focus: "center" },
  },
  {
    id: "malika-benjelloun",
    names: "Malika Benjelloun",
    discipline: "Street jazz",
    bio: "Coach et chorégraphe de la Star Academy, figure de la scène urbaine, reconnue pour son énergie et sa pédagogie.",
    photo: { src: "/images/guests/malika-benjelloun.webp", alt: "Malika Benjelloun", focus: "top" },
  },
  {
    id: "loriane-cateloy-rose",
    names: "Loriane Cateloy-Rose",
    discipline: "Heels, street jazz",
    bio: "Formée au Conservatoire de Boulogne-Billancourt, à Los Angeles et à New York. Elle fonde l'Awakening Dance Company en 2023.",
    photo: { src: "/images/guests/loriane-cateloy-rose.webp", alt: "Loriane Cateloy-Rose", focus: "top" },
  },
  {
    id: "juliette-gernez",
    names: "Juliette Gernez",
    discipline: "Classique, contemporain",
    bio: "Formée au Conservatoire national de Paris et à l'École de danse de l'Opéra de Paris, entrée à 17 ans dans le corps de ballet, où elle obtient des rôles de soliste.",
    photo: { src: "/images/guests/juliette-gernez.webp", alt: "Juliette Gernez", focus: "top" },
  },
  {
    id: "marjorie-ascione",
    names: "Marjorie Ascione",
    discipline: "Comédie musicale",
    bio: "Chorégraphe et actrice des grandes comédies musicales françaises (Le Roi Soleil, Les 10 Commandements), elle a mis en scène pour La France a un incroyable talent.",
    photo: { src: "/images/guests/marjorie-ascione.webp", alt: "Marjorie Ascione", focus: "top" },
  },
  {
    id: "whoxver",
    names: "Whoxver",
    discipline: "Moderne, contemporain",
    bio: "Révélée sur les réseaux sociaux, où elle réunit plus de 5 millions d'abonnés, elle fait le lien entre performance, création numérique et culture populaire.",
    photo: null,
  },
];

/// Invités mis en avant sur l'accueil (texte seul, sans photo).
export const FEATURED_GUEST_IDS = [
  "chris-marques-jaclyn-spencer",
  "jordan-mouillerac",
  "romain-guillermic-fauve-hautot",
  "malika-benjelloun",
  "juliette-gernez",
  "loriane-cateloy-rose",
] as const;

export function getFeaturedGuests(): Guest[] {
  return FEATURED_GUEST_IDS.flatMap((id) => GUESTS.filter((guest) => guest.id === id));
}
