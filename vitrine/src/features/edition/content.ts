/// Édition annoncée sur la vitrine. Les dates viennent du site actuel de
/// l'association ; les horaires reprennent ceux de 2026 en attendant 2027.
export const EDITION = {
  year: 2027,
  /// Vendredi : cérémonie d'ouverture. Le Salon ouvre au public le samedi.
  openingDate: "2027-05-14",
  closingDate: "2027-05-16",
  datesLabel: "14, 15 et 16 mai 2027",
} as const;

export type EditionDay = {
  isoDate: string;
  label: string;
  title: string;
  hours: string;
  summary: string;
};

export const EDITION_DAYS: readonly EditionDay[] = [
  {
    isoDate: "2027-05-14",
    label: "Vendredi 14 mai",
    title: "Cérémonie d'ouverture",
    hours: "17h30 à 20h",
    summary: "Soirée d'inauguration sur billet dédié, interdite aux moins de 12 ans.",
  },
  {
    isoDate: "2027-05-15",
    label: "Samedi 15 mai",
    title: "Le Salon",
    hours: "9h à 19h",
    summary: "Démonstrations, initiations, masterclass, conférences et clubbing.",
  },
  {
    isoDate: "2027-05-16",
    label: "Dimanche 16 mai",
    title: "Le Salon",
    hours: "9h à 18h",
    summary: "Démonstrations, initiations, masterclass et conférences.",
  },
];

export const HOURS_NOTICE = "Horaires indicatifs, sur la base de l'édition 2026.";

export const VENUE = {
  name: "Centre de Congrès Jean-Monnier",
  street: "33 boulevard Carnot",
  city: "49100 Angers",
  tram: "Arrêt « Centre de congrès », lignes A et B",
  // Convention avec la Région prévue par le plan d'action 2027, pas encore signée.
  train: "En projet pour 2027 : un billet TER Aléop à 5 € aller-retour avec la Région Pays de la Loire, depuis Nantes, Le Mans et les autres villes de l'Ouest.",
  paidParkings: ["Mail", "Place Leclerc", "Place Imbach"],
  freeParking: "La Rochefoucauld, à environ 12 minutes à pied",
} as const;

export const CONTACT = {
  phone: "02 41 93 83 77",
  phoneHref: "tel:+33241938377",
  email: "salondeladanse49@gmail.com",
  organizer: "JayDance Fam",
} as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/salondeladanse" },
  { label: "Facebook", href: "https://www.facebook.com/people/Salon-de-la-Danse/61559903834866/" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCnTemiSAcNLy65oeKN4d8Ig" },
] as const;
