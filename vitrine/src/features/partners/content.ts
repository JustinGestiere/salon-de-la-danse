export type PartnerTier = "gold" | "silver" | "bronze";

export type Partner = {
  id: string;
  name: string;
  /// null : logo non fourni, le nom s'affiche à la place.
  logo: string | null;
};

const withLogo = (id: string, name: string): Partner => ({ id, name, logo: `/images/partners/${id}.webp` });
const withoutLogo = (id: string, name: string): Partner => ({ id, name, logo: null });

export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  gold: "Partenaires Gold",
  silver: "Partenaires Silver",
  bronze: "Partenaires Bronze",
};

/// Partenaires 2026, d'après le site de l'association.
export const PARTNERS_BY_TIER: Record<PartnerTier, readonly Partner[]> = {
  gold: [
    withoutLogo("maine-et-loire", "Département de Maine-et-Loire"),
    withoutLogo("ville-angers", "Ville d'Angers"),
    withoutLogo("angers-loire-metropole", "Angers Loire Métropole"),
    withLogo("darty-espace-anjou", "Darty Espace Anjou"),
    withLogo("angers-info", "Angers Info"),
    withLogo("alouette", "Alouette"),
  ],
  silver: [
    withoutLogo("mondapar", "Mondapar"),
    withoutLogo("mbc", "MBC"),
    withLogo("l-adresse", "L'Adresse"),
    withLogo("galerie-espace-anjou", "La Galerie Espace Anjou"),
    withLogo("moutarde-serigraphie", "Moutarde Sérigraphie"),
    withLogo("anthony-coiffure", "Anthony Coiffure"),
    withoutLogo("l-arche-angers", "L'Arche Angers"),
    withLogo("grenier-gourmet", "Le Grenier Gourmet"),
    withoutLogo("decathlon-ponts-de-ce", "Decathlon Les Ponts-de-Cé"),
    withLogo("pathe-angers", "Pathé Angers"),
  ],
  bronze: [
    withLogo("comptoir-ferdinand", "Comptoir Ferdinand"),
    withoutLogo("khera", "Khera"),
    withLogo("bellerive", "Restaurant Bellerive"),
    withoutLogo("mon-stage-de-danse", "MonStagedeDanse"),
  ],
};

export const PARTNER_TIERS: readonly PartnerTier[] = ["gold", "silver", "bronze"];
