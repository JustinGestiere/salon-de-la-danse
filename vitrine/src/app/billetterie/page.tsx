import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { EDITION } from "@/features/edition/content";
import { PriceTable } from "@/features/tickets/components/price-table";
import { SeatsGauge } from "@/features/tickets/components/seats-gauge";
import { TicketOrderForm, type TicketOffer } from "@/features/tickets/components/ticket-order-form";
import { TICKET_TYPES } from "@/features/tickets/content";
import { getSalePeriod } from "@/features/tickets/pricing";
import { getSeatAvailabilityForDisplay } from "@/features/tickets/queries";

export const metadata: Metadata = {
  title: "Billetterie",
  description: `Billets à la journée, pour le week-end ou en pack famille pour le Salon de la Danse d'Angers ${EDITION.year}. Paiement sécurisé par carte.`,
};

type TicketsPageProps = {
  searchParams: Promise<{ paiement?: string | string[] }>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const { paiement } = await searchParams;
  const period = getSalePeriod(new Date());
  const seatAvailability = await getSeatAvailabilityForDisplay();
  const offers: TicketOffer[] = TICKET_TYPES.map((ticketType) => ({
    id: ticketType.id,
    label: ticketType.label,
    audience: ticketType.audience,
    unitPriceInCents: ticketType.pricesInCents[period.id],
  }));

  return (
    <Container className="flex flex-col gap-16">
      <PageIntro kicker={`Billetterie ${EDITION.year}`} title="Prenez" emphasis="vos billets">
        <p>
          Une journée, le week-end ou toute la famille. Gratuit pour les moins de 6 ans. Le tarif réduit (6-15 ans,
          étudiants, plus de 65 ans) se justifie à l'entrée.
        </p>
      </PageIntro>

      {paiement === "annule" ? (
        <p role="status" className="-mt-8 rounded-2xl bg-warn-soft px-5 py-4 text-warn-ink">
          Paiement annulé : rien n'a été débité. Votre sélection est à refaire ci-dessous.
        </p>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-4xl text-ink">
            {period.isSoldOnline ? period.label : "Vente en ligne terminée"}
          </h2>
          {period.isSoldOnline ? (
            <TicketOrderForm offers={offers} />
          ) : (
            <p className="text-lg text-ink-soft">Les billets restent en vente à l'entrée du Salon, au tarif sur place.</p>
          )}
        </div>
        <aside className="flex flex-col gap-5 self-start rounded-[28px] border border-line bg-surface p-7 lg:sticky lg:top-28">
          {seatAvailability ? (
            <SeatsGauge availability={seatAvailability} />
          ) : (
            <p className="text-muted">Le compteur de places s'affichera à l'ouverture du paiement en ligne.</p>
          )}
          <p className="border-t border-line pt-5 text-sm leading-relaxed text-muted">
            Un billet 1 jour vaut pour le samedi ou le dimanche. La cérémonie d'ouverture du vendredi a son billet
            à part.
          </p>
        </aside>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading title="Tous les" emphasis="tarifs" aside="Plus tôt vous réservez, moins c'est cher." />
        <PriceTable currentPeriodId={period.id} />
      </section>
    </Container>
  );
}
