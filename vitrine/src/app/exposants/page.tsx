import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { LogoGrid, type LogoItem } from "@/components/ui/logo-grid";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { EDITION } from "@/features/edition/content";
import {
  EXHIBITORS_EDITION_YEAR,
  FOOD_STANDS,
  INSTITUTIONS,
  SCHOOLS_AND_ASSOCIATIONS,
  SHOPS_AND_BRANDS,
  WORLD_DANCE_COMPANIES,
} from "@/features/exhibitors/content";

export const metadata: Metadata = {
  title: "Exposants",
  description: "Écoles, associations, institutions, compagnies de danses du monde, boutiques et restauration : les exposants du Salon de la Danse.",
};

const SECTIONS: readonly { id: string; title: string; emphasis: string; items: readonly LogoItem[] }[] = [
  { id: "institutions", title: "Les grandes", emphasis: "institutions", items: INSTITUTIONS },
  { id: "schools", title: "Écoles et", emphasis: "associations", items: SCHOOLS_AND_ASSOCIATIONS },
  { id: "world", title: "Village des", emphasis: "danses du monde", items: WORLD_DANCE_COMPANIES },
  { id: "shops", title: "Boutiques et", emphasis: "marques", items: SHOPS_AND_BRANDS },
  { id: "food", title: "Pour", emphasis: "reprendre des forces", items: FOOD_STANDS },
];

export default function ExhibitorsPage() {
  return (
    <Container className="flex flex-col gap-16">
      <PageIntro kicker={`Ils étaient là en ${EXHIBITORS_EDITION_YEAR}`} title="Les" emphasis="exposants">
        <p>
          Environ 100 exposants sur trois niveaux : de quoi trouver son école, son cours, sa tenue ou son prochain
          stage. La liste {EDITION.year} sera publiée à l'approche du Salon.
        </p>
      </PageIntro>
      {SECTIONS.map((section) => (
        <section key={section.id} className="flex flex-col gap-8">
          <SectionHeading title={section.title} emphasis={section.emphasis} />
          <LogoGrid items={section.items} />
        </section>
      ))}
    </Container>
  );
}
