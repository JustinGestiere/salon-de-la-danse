import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { LogoGrid } from "@/components/ui/logo-grid";
import { PageIntro } from "@/components/ui/page-intro";
import { CONTACT } from "@/features/edition/content";
import { PARTNERS_BY_TIER, PARTNER_TIERS, PARTNER_TIER_LABELS } from "@/features/partners/content";

export const metadata: Metadata = {
  title: "Partenaires",
  description: "Collectivités, entreprises et commerces angevins qui soutiennent le Salon de la Danse.",
};

export default function PartnersPage() {
  return (
    <Container className="flex flex-col gap-16">
      <PageIntro kicker="Merci à eux" title="Nos" emphasis="partenaires">
        <p>
          Un événement 100 % local, rendu possible par les collectivités, entreprises et commerces angevins.
          Envie de nous soutenir ?{" "}
          <a href={`mailto:${CONTACT.email}`} className="font-medium text-accent hover:underline">
            Écrivez-nous
          </a>
          .
        </p>
      </PageIntro>
      {PARTNER_TIERS.map((tier) => (
        <section key={tier} className="flex flex-col gap-8">
          <h2 className="font-display text-4xl text-ink">{PARTNER_TIER_LABELS[tier]}</h2>
          <LogoGrid items={PARTNERS_BY_TIER[tier]} size={tier === "gold" ? "lg" : "md"} />
        </section>
      ))}
    </Container>
  );
}
