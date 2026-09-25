/// Grille tarifaire. Elle reprend les prix 2026 de l'association, décalés sur
/// les dates 2027 : à faire valider avant l'ouverture de la billetterie.
/// Tous les montants sont en centimes.

export const SALE_PERIOD_IDS = ["earlyBird", "presale", "onSite"] as const;
export type SalePeriodId = (typeof SALE_PERIOD_IDS)[number];

export type SalePeriod = {
  id: SalePeriodId;
  label: string;
  /// Fin de période (exclue), en UTC. null pour la vente sur place.
  endsAt: string | null;
  isSoldOnline: boolean;
};

export const SALE_PERIODS: readonly SalePeriod[] = [
  // Minuit à Angers le 15 avril 2027 : le lève-tôt court jusqu'au 14 inclus.
  { id: "earlyBird", label: "Tarif lève-tôt, jusqu'au 14 avril", endsAt: "2027-04-14T22:00:00Z", isSoldOnline: true },
  // La prévente s'arrête à l'ouverture du Salon au public, le samedi matin.
  { id: "presale", label: "Prévente, jusqu'au 14 mai", endsAt: "2027-05-14T22:00:00Z", isSoldOnline: true },
  { id: "onSite", label: "Sur place", endsAt: null, isSoldOnline: false },
];

export const TICKET_TYPE_IDS = [
  "adultOneDay",
  "adultTwoDays",
  "reducedOneDay",
  "reducedTwoDays",
  "familyOneDay",
  "familyTwoDays",
  "openingCeremony",
] as const;
export type TicketTypeId = (typeof TICKET_TYPE_IDS)[number];

export type TicketType = {
  id: TicketTypeId;
  label: string;
  audience: string;
  /// Personnes que le billet fait entrer au Salon (samedi et dimanche). La
  /// cérémonie d'ouverture a sa propre salle et ne consomme pas de place.
  salonSeats: number;
  pricesInCents: Record<SalePeriodId, number>;
};

export const TICKET_TYPES: readonly TicketType[] = [
  {
    id: "adultOneDay",
    label: "Plein tarif, 1 jour",
    audience: "À partir de 16 ans, samedi ou dimanche",
    salonSeats: 1,
    pricesInCents: { earlyBird: 1350, presale: 1490, onSite: 1700 },
  },
  {
    id: "adultTwoDays",
    label: "Plein tarif, 2 jours",
    audience: "À partir de 16 ans, samedi et dimanche",
    salonSeats: 1,
    pricesInCents: { earlyBird: 2090, presale: 2690, onSite: 2990 },
  },
  {
    id: "reducedOneDay",
    label: "Tarif réduit, 1 jour",
    audience: "6-15 ans, étudiants, plus de 65 ans, sur justificatif",
    salonSeats: 1,
    pricesInCents: { earlyBird: 990, presale: 1090, onSite: 1200 },
  },
  {
    id: "reducedTwoDays",
    label: "Tarif réduit, 2 jours",
    audience: "6-15 ans, étudiants, plus de 65 ans, sur justificatif",
    salonSeats: 1,
    pricesInCents: { earlyBird: 1690, presale: 1890, onSite: 2100 },
  },
  {
    id: "familyOneDay",
    label: "Pack famille, 1 jour",
    audience: "2 adultes et 2 enfants",
    salonSeats: 4,
    pricesInCents: { earlyBird: 3500, presale: 3900, onSite: 4900 },
  },
  {
    id: "familyTwoDays",
    label: "Pack famille, 2 jours",
    audience: "2 adultes et 2 enfants",
    salonSeats: 4,
    pricesInCents: { earlyBird: 5900, presale: 6900, onSite: 7900 },
  },
  {
    id: "openingCeremony",
    label: "Cérémonie d'ouverture",
    audience: "Vendredi 14 mai, 17h30, interdite aux moins de 12 ans",
    salonSeats: 0,
    pricesInCents: { earlyBird: 1900, presale: 1900, onSite: 1900 },
  },
];

/// Jauge du Salon en nombre de visiteurs. Valeur de démonstration : la
/// capacité réelle du Centre de Congrès doit être fournie par l'association.
export const SALON_CAPACITY = 2500;

/// Sous ce ratio de places restantes, le compteur passe en « dernières places ».
export const LOW_AVAILABILITY_RATIO = 0.1;

export const MAX_QUANTITY_PER_TICKET_TYPE = 10;

/// Conditions générales de vente publiées par l'association.
export const TERMS_OF_SALE_URL =
  "https://acrobat.adobe.com/id/urn:aaid:sc:EU:c9bbd4d8-ab32-47e1-b9f4-95c842f7710c";
