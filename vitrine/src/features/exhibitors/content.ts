export type Exhibitor = {
  id: string;
  name: string;
  logo: string;
};

const exhibitor = (id: string, name: string, folder = "exhibitors"): Exhibitor => ({
  id,
  name,
  logo: `/images/${folder}/${id}.webp`,
});

/// Exposants présents en 2026, identifiés à partir des logos fournis par
/// l'association. La liste 2027 n'est pas encore connue.
export const EXHIBITORS_EDITION_YEAR = 2026;

export const INSTITUTIONS: readonly Exhibitor[] = [
  exhibitor("cndc", "CNDC Angers"),
  exhibitor("crr-angers", "Conservatoire à rayonnement régional d'Angers"),
  exhibitor("inm", "Institut national du music-hall"),
  exhibitor("ecole-nationale-cabaret", "École nationale de cabaret"),
];

export const SCHOOLS_AND_ASSOCIATIONS: readonly Exhibitor[] = [
  exhibitor("alma-danse", "Alma Danse"),
  exhibitor("angieus-school", "Angieus School"),
  exhibitor("atelier-pole-passion", "Atelier Pole Passion"),
  exhibitor("avant-deux-haut-anjou", "Avant-Deux du Haut-Anjou"),
  exhibitor("b-pop-angers", "B-Pop Angers"),
  exhibitor("creadanse", "Créadanse"),
  exhibitor("danse-sur-glace-angers", "Danse sur glace Angers"),
  exhibitor("daze", "Daze"),
  exhibitor("eclats-de-corps", "Éclats de corps"),
  exhibitor("ecole-melanie-piedsnoirs", "École de danse Mélanie Piedsnoirs"),
  exhibitor("fanfan-l-angevine", "Fanfan l'Angevine"),
  exhibitor("golden-angels", "Golden Angels"),
  exhibitor("groovit", "Groov'It"),
  exhibitor("habanera", "Habanera"),
  exhibitor("jaydance-fitness", "JayDance Fitness"),
  exhibitor("ker-kreol", "Ker Kréol"),
  exhibitor("le-centre-de-la-danse", "Le Centre de la danse"),
  exhibitor("men-glaz", "Men Glaz, bagad et danse"),
  exhibitor("mexicasso", "Mexicasso"),
  exhibitor("rencontre-internationale-danses", "Rencontre internationale de danses d'Angers"),
  exhibitor("reve-danse", "Rêve Danse"),
  exhibitor("sambalatina", "Compagnie Sambalatina"),
  exhibitor("studio-49-dance", "Studio 49 Dance"),
  exhibitor("urban-dance-school", "Urban Dance School"),
];

export const SHOPS_AND_BRANDS: readonly Exhibitor[] = [
  exhibitor("aleozen", "Aleozen"),
  exhibitor("biotechusa", "BioTechUSA Espace Anjou"),
  exhibitor("danse-des-couleurs", "Danse des couleurs"),
  exhibitor("evidanse", "Evidanse"),
  exhibitor("sacre-paris", "Sacre Paris"),
  exhibitor("sportigo", "Sportigo"),
];

export const WORLD_DANCE_COMPANIES: readonly Exhibitor[] = [
  exhibitor("acroellips", "AcroEllip's", "world-dances"),
  exhibitor("bilkiss", "Bilkiss", "world-dances"),
  exhibitor("kaminu", "Kaminu, compagnie franco-péruvienne", "world-dances"),
  exhibitor("malaya", "Malaya, collectif chorégraphique", "world-dances"),
  exhibitor("oritahiti", "Oritahiti", "world-dances"),
];

export const FOOD_STANDS: readonly Exhibitor[] = [
  exhibitor("bichette-patisseries", "Bichette Pâtisseries", "restaurants"),
  exhibitor("comptoir-a-cookies", "Comptoir à cookies", "restaurants"),
  exhibitor("la-brulerie-de-pithecus", "La Brûlerie de Pithecus", "restaurants"),
  exhibitor("le-fournil-d-arnaud", "Le Fournil d'Arnaud", "restaurants"),
  exhibitor("o-sakura-sushi", "O'Sakura Sushi", "restaurants"),
  exhibitor("oh-pinaise", "Oh Pinaise !", "restaurants"),
  exhibitor("super-green", "Super Green", "restaurants"),
  exhibitor("tantoast", "Tantoast", "restaurants"),
];
