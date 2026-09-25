/// Grille tarifaire 2027, d'après le plan d'action stratégique de
/// l'association (grille p. 3, chantiers A1, A2 et A5). Montants en centimes.

export const PRICE_TIERS = ["earlyBird", "fullPrice"] as const;
export type PriceTier = (typeof PRICE_TIERS)[number];

/// Le guichet du Salon vend au plein tarif majoré : ce prix n'est qu'affiché.
export const ON_SITE_SURCHARGE_IN_CENTS = 200;

export const SALE_PHASE_IDS = ["privateSale", "earlyBird", "fullPrice"] as const;
export type SalePhaseId = (typeof SALE_PHASE_IDS)[number];

export type SalePhase = {
  id: SalePhaseId;
  label: string;
  /// Début inclus et fin exclue, en UTC (minuit à Angers).
  startsAt: string;
  endsAt: string;
  priceTier: PriceTier;
  /// Vente privée : réservée aux licenciés FFDanse et aux écoles, sur code.
  isPrivate: boolean;
};

/// Jalons comptés depuis J = samedi 15 mai 2027, ouverture du Salon au public.
/// Entre la vente privée et J-45, la billetterie en ligne reste fermée.
export const SALE_PHASES: readonly SalePhase[] = [
  // J-90, 48 heures : du 14 février 0 h au 16 février 0 h (heure d'hiver).
  {
    id: "privateSale",
    label: "Vente privée licenciés et écoles",
    startsAt: "2027-02-13T23:00:00Z",
    endsAt: "2027-02-15T23:00:00Z",
    priceTier: "earlyBird",
    isPrivate: true,
  },
  // J-45 à J-30 : du 31 mars au 14 avril inclus (heure d'été).
  {
    id: "earlyBird",
    label: "Early Bird, jusqu'au 14 avril",
    startsAt: "2027-03-30T22:00:00Z",
    endsAt: "2027-04-14T22:00:00Z",
    priceTier: "earlyBird",
    isPrivate: false,
  },
  // À partir de J-30, jusqu'à la veille de l'ouverture au public.
  {
    id: "fullPrice",
    label: "Plein tarif, jusqu'au 14 mai",
    startsAt: "2027-04-14T22:00:00Z",
    endsAt: "2027-05-14T22:00:00Z",
    priceTier: "fullPrice",
    isPrivate: false,
  },
];

export const TICKET_TYPE_IDS = [
  "discoveryPass",
  "passionPass",
  "reducedDayPass",
  "openingEvening",
  "masterclassSession",
] as const;
export type TicketTypeId = (typeof TICKET_TYPE_IDS)[number];

/// Jauges auxquelles les billets sont décomptés.
export const TICKET_GAUGES = ["salon", "openingEvening", "masterclass"] as const;
export type TicketGauge = (typeof TICKET_GAUGES)[number];

export type TicketType = {
  id: TicketTypeId;
  label: string;
  audience: string;
  gauge: TicketGauge;
  pricesInCents: Record<PriceTier, number>;
};

export const TICKET_TYPES: readonly TicketType[] = [
  {
    id: "discoveryPass",
    label: "Pass Découverte, 1 jour",
    audience: "Samedi ou dimanche. Le dimanche, gala de clôture inclus dans la limite des places.",
    gauge: "salon",
    pricesInCents: { earlyBird: 1400, fullPrice: 1800 },
  },
  {
    id: "passionPass",
    label: "Pass Passion, 2 jours",
    audience: "Samedi et dimanche, gala de clôture inclus dans la limite des places.",
    gauge: "salon",
    pricesInCents: { earlyBird: 2400, fullPrice: 3200 },
  },
  {
    id: "reducedDayPass",
    label: "Tarif réduit, 1 jour",
    audience: "Scolaires, moins de 25 ans, demandeurs d'emploi, sur justificatif à l'entrée.",
    gauge: "salon",
    pricesInCents: { earlyBird: 1000, fullPrice: 1300 },
  },
  {
    id: "openingEvening",
    label: "Soirée d'inauguration",
    audience: "Vendredi 14 mai : showcases de professionnels et cocktail, interdite aux moins de 12 ans.",
    gauge: "openingEvening",
    pricesInCents: { earlyBird: 1800, fullPrice: 2200 },
  },
  {
    id: "masterclassSession",
    label: "Option masterclass",
    audience: "Par séance d'1h30 avec un chorégraphe invité, en complément d'un pass.",
    gauge: "masterclass",
    pricesInCents: { earlyBird: 1500, fullPrice: 1800 },
  },
];

/// Volumes cibles du plan 2027 (7 000 festivaliers et 800 séances de
/// masterclass), utilisés comme jauges de vente en ligne.
export const GAUGE_CAPACITIES: Record<TicketGauge, number> = {
  salon: 6300,
  openingEvening: 700,
  masterclass: 800,
};

export const GAUGE_LABELS: Record<TicketGauge, string> = {
  salon: "le Salon",
  openingEvening: "la soirée d'inauguration",
  masterclass: "les masterclass",
};

/// Plafond des remises accordées par codes promo, en part du chiffre d'affaires
/// brut (chantier A1). Une fois atteint, les codes ne sont plus proposés.
export const MAX_DISCOUNT_RATIO = 0.08;

/// Sous ce ratio de places restantes, le compteur passe en « dernières places ».
export const LOW_AVAILABILITY_RATIO = 0.1;

export const MAX_QUANTITY_PER_TICKET_TYPE = 10;

/// Conditions générales de vente publiées par l'association.
export const TERMS_OF_SALE_URL =
  "https://acrobat.adobe.com/id/urn:aaid:sc:EU:c9bbd4d8-ab32-47e1-b9f4-95c842f7710c";
