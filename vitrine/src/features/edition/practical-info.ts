/// Règles d'accueil de l'édition 2026, reprises en attendant 2027.
export const VISIT_RULES = [
  { id: "wristband", title: "Bracelet", text: "Remis à l'entrée : gardez-le pour sortir et revenir librement dans la journée." },
  { id: "free-under-six", title: "Moins de 6 ans", text: "Entrée gratuite." },
  { id: "cloakroom", title: "Vestiaire surveillé", text: "2 € pour les vêtements et les sacs, 4 € pour les trottinettes et les poussettes (tarifs 2026)." },
  { id: "strollers", title: "Poussettes", text: "Interdites au niveau -2, où se trouvent la scène et l'espace clubbing." },
  { id: "picnic", title: "Pique-nique", text: "Interdit dans l'enceinte du Salon : les stands de restauration vous attendent." },
] as const;

/// Accessibilité du Centre de Congrès, d'après sa fiche Acceslibre.
export const ACCESSIBILITY_FACTS = [
  "Entrée de plain-pied, porte automatique, avec une entrée dédiée aux personnes en situation de handicap",
  "Aide humaine possible à l'accueil, personnel sensibilisé",
  "Ascenseur vers tous les niveaux et toilettes adaptées",
  "Places de stationnement adaptées à proximité",
] as const;

export const ACCESSIBILITY_SOURCE_URL =
  "https://acceslibre.beta.gouv.fr/app/49-angers/a/salle-de-spectacle/erp/centre-de-congres-jean-monnier-angers/";

export const FAQ = [
  {
    id: "included",
    question: "Qu'est-ce qui est compris dans le billet ?",
    answer: "Les stands, les démonstrations, les initiations, les conférences gratuites, le Just Dance, l'espace clubbing et, le dimanche, le gala de clôture dans la limite des places. Les masterclass s'ajoutent en option, par séance.",
  },
  {
    id: "masterclass",
    question: "Faut-il réserver les masterclass ?",
    answer: "Oui. Chaque masterclass accueille 90 personnes au plus, selon le style. Arrivez 15 minutes avant le début.",
  },
  {
    id: "initiations",
    question: "Et les initiations ?",
    answer: "Aucune inscription : premier arrivé, premier placé, sans niveau requis.",
  },
  {
    id: "reduced",
    question: "Qui a droit au tarif réduit ?",
    answer: "Les scolaires, les moins de 25 ans et les demandeurs d'emploi, sur présentation d'un justificatif à l'entrée. L'entrée est gratuite pour les moins de 6 ans.",
  },
] as const;
