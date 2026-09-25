/// Contenu de la page « Pourquoi pas vous ? », pensée pour le public qui ne
/// se sent pas concerné par la danse, les hommes en premier.

export type StyleFormat = "solo" | "duo" | "group";

export const STYLE_FORMAT_LABELS: Record<StyleFormat, string> = {
  solo: "En solo, en battle",
  duo: "En duo",
  group: "En groupe",
};

export type DanceStyle = {
  id: string;
  name: string;
  format: StyleFormat;
  pitch: string;
};

export const DANCE_STYLES: readonly DanceStyle[] = [
  { id: "breaking", name: "Breaking", format: "solo", pitch: "Freezes, power moves, footwork. De la force, de l'équilibre et du culot." },
  { id: "electro", name: "Électro", format: "solo", pitch: "Des bras rapides et précis. Romain Guillermic en est champion du monde." },
  { id: "krump-hip-hop", name: "Krump, hip-hop", format: "solo", pitch: "L'énergie brute et le groove. On y danse ce qu'on a dans le ventre." },
  { id: "salsa-rock", name: "Salsa, rock", format: "duo", pitch: "Le guide lance les figures et mène sa partenaire. Idéal pour sortir danser." },
  { id: "standard", name: "Standard", format: "duo", pitch: "Valse, quickstep, tango : la posture et la précision de Chris Marques." },
  { id: "breton", name: "Danses bretonnes", format: "group", pitch: "En ligne ou en cercle, au son du bagad. Men Glaz, de Trélazé, était là en 2026." },
  { id: "ori-tahiti", name: "Ori tahiti", format: "group", pitch: "Côté hommes, une danse puissante, ancrée dans le sol, au rythme des percussions." },
  { id: "just-dance-clubbing", name: "Just Dance, clubbing", format: "group", pitch: "Pour se chauffer sans pression : écran géant, puis DJ Roxs au niveau -2." },
];

export type Myth = {
  id: string;
  quote: string;
  answer: string;
};

export const MYTHS: readonly Myth[] = [
  {
    id: "girls-only",
    quote: "C'est un truc de filles.",
    answer: "Le breaking est discipline olympique depuis Paris 2024. Les champions du monde de danse de salon, d'électro ou de salsa invités au Salon sont des hommes comme des femmes.",
  },
  {
    id: "no-rhythm",
    quote: "Je n'ai aucun rythme.",
    answer: "Le rythme se travaille, comme le cardio. Les initiations sont faites pour les débutants complets : aucun niveau requis, aucune inscription.",
  },
  {
    id: "ridiculous",
    quote: "Je vais avoir l'air ridicule.",
    answer: "En initiation, tout le monde débute en même temps que vous. Venez à plusieurs : c'est plus facile d'entrer dans le cercle en bande.",
  },
  {
    id: "not-a-sport",
    quote: "Ce n'est pas du sport.",
    answer: "Explosivité, gainage, endurance, coordination. Faites une masterclass d'1h30 et reparlez-en le lendemain.",
  },
];

export const FIRST_VISIT_STEPS = [
  { id: "watch", title: "Regardez", description: "Une démonstration sur la scène principale, niveau -2. Repérez le style qui vous parle." },
  { id: "try", title: "Essayez", description: "Une initiation salle Darty ou en terrasse, niveau 0. Sans inscription, premier arrivé premier placé." },
  { id: "train", title: "Osez la masterclass", description: "1h30 salle Grand Angle, niveau +2, avec un invité. 90 places, sur réservation." },
  { id: "party", title: "Finissez au clubbing", description: "DJ Roxs aux platines, niveau -2. Ce que vous avez appris, vous le ressortez ici." },
] as const;

/// Les trois faits de l'accueil, section « Pourquoi pas vous ? ».
export const WHY_NOT_YOU_FACTS = [
  { id: "olympics", figure: "2024", text: "Le breaking devient discipline olympique aux Jeux de Paris." },
  { id: "world-champion", figure: "3 fois", text: "champion du monde : Chris Marques, invité du Salon 2026." },
  { id: "lead", figure: "Le guide", text: "En salsa comme en rock, c'est lui qui mène la danse." },
] as const;

/// Palmarès des invités masculins, repris sur la page.
export const MALE_ROLE_MODELS = [
  { id: "chris-marques", name: "Chris Marques", achievement: "Champion du monde, 2004 à 2006" },
  { id: "jordan-mouillerac", name: "Jordan Mouillerac", achievement: "Champion de France de salsa 2013 et 2017" },
  { id: "romain-guillermic", name: "Romain Guillermic", achievement: "Champion du monde d'électro en solo, 2017" },
] as const;
