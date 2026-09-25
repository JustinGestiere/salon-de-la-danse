import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { CONTACT } from "@/features/edition/content";
import { TERMS_OF_SALE_URL } from "@/features/tickets/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

const SECTION_TITLE = "font-display text-3xl text-ink";

export default function LegalNoticePage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-10">
      <PageIntro kicker="Informations" title="Mentions" emphasis="légales" />

      <section className="flex flex-col gap-3 leading-relaxed text-ink-soft">
        <h2 className={SECTION_TITLE}>Éditeur</h2>
        <p>
          Association {CONTACT.organizer}, organisatrice du Salon de la Danse d'Angers.
          <br />
          Téléphone : {CONTACT.phone}. E-mail : {CONTACT.email}.
        </p>
        <p className="text-sm text-subtle">
          Adresse du siège, numéro RNA ou SIRET, directeur de la publication et hébergeur : à compléter par
          l'association avant la mise en ligne.
        </p>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-ink-soft">
        <h2 className={SECTION_TITLE}>Billetterie</h2>
        <p>
          Le paiement est traité par Stripe : le site ne voit ni ne conserve vos coordonnées bancaires. Les achats
          sont soumis aux{" "}
          <a href={TERMS_OF_SALE_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            conditions générales de vente
          </a>{" "}
          de l'association.
        </p>
      </section>

      <section className="flex flex-col gap-3 leading-relaxed text-ink-soft">
        <h2 className={SECTION_TITLE}>Cookies</h2>
        <p>
          Le site dépose un seul cookie, qui mémorise votre choix de thème clair ou sombre. Il n'y a ni mesure
          d'audience ni publicité.
        </p>
      </section>
    </Container>
  );
}
