import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { EDITION } from "@/features/edition/content";
import { getTicketingNow } from "@/features/tickets/clock";
import { PriceTable } from "@/features/tickets/components/price-table";
import { SalesCalendarNotice } from "@/features/tickets/components/sales-calendar-notice";
import { SeatsGauge } from "@/features/tickets/components/seats-gauge";
import { TicketOrderForm, type TicketOffer } from "@/features/tickets/components/ticket-order-form";
import { TICKET_TYPES } from "@/features/tickets/content";
import { getSaleStatus, type SaleStatus } from "@/features/tickets/pricing";
import { getSeatAvailabilityForDisplay } from "@/features/tickets/queries";

export const metadata: Metadata = {
  title: "Billetterie",
  description: `Pass 1 jour, Pass 2 jours avec le gala de clôture, tarif réduit et soirée d'inauguration du Salon de la Danse d'Angers ${EDITION.year}. Paiement sécurisé par carte.`,
};

type TicketsPageProps = {
  searchParams: Promise<{ paiement?: string | string[] }>;
};

function getCurrentPriceColumn(status: SaleStatus): "earlyBird" | "fullPrice" | "onSite" | null {
  if (status.kind === "open") return status.phase.priceTier;
  if (status.kind === "ended") return "onSite";
  return null;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const { paiement } = await searchParams;
  const status = getSaleStatus(getTicketingNow());
  const seatAvailability = await getSeatAvailabilityForDisplay();
  const offers: TicketOffer[] =
    status.kind === "open"
      ? TICKET_TYPES.map((ticketType) => ({
          id: ticketType.id,
          label: ticketType.label,
          audience: ticketType.audience,
          unitPriceInCents: ticketType.pricesInCents[status.phase.priceTier],
        }))
      : [];

  return (
    <Container className="flex flex-col gap-16">
      <PageIntro kicker={`Billetterie ${EDITION.year}`} title="Prenez" emphasis="vos billets">
        <p>
          Un jour ou le week-end, avec le gala de clôture du dimanche compris dans les pass. Entrée gratuite pour les
          moins de 6 ans, tarif réduit sur justificatif pour les scolaires, les moins de 25 ans et les demandeurs
          d'emploi.
        </p>
      </PageIntro>

      {paiement === "annule" ? (
        <p role="status" className="-mt-8 rounded-2xl bg-warn-soft px-5 py-4 text-warn-ink">
          Paiement annulé : rien n'a été débité. Votre sélection est à refaire ci-dessous.
        </p>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="flex flex-col gap-6">
          {status.kind === "open" ? (
            <>
              <h2 className="font-display text-4xl text-ink">{status.phase.label}</h2>
              <TicketOrderForm offers={offers} isPrivateSale={status.phase.isPrivate} />
            </>
          ) : (
            <SalesCalendarNotice status={status} />
          )}
        </div>
        <aside className="flex flex-col gap-5 self-start rounded-[28px] border border-line bg-surface p-7 lg:sticky lg:top-28">
          {seatAvailability ? (
            <SeatsGauge availability={seatAvailability} />
          ) : (
            <p className="text-muted">Le compteur de places s'affichera à l'ouverture du paiement en ligne.</p>
          )}
          <ul className="flex flex-col gap-3 border-t border-line pt-5 text-sm leading-relaxed text-muted">
            <li>Gala de clôture le dimanche à 16 h, inclus dans les pass dans la limite des places.</li>
            <li>Masterclass : une option par séance, à ajouter à votre pass.</li>
            <li>Code promo école ou partenaire : à saisir sur la page de paiement.</li>
          </ul>
        </aside>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading title="Tous les" emphasis="tarifs" aside="Plus tôt vous réservez, moins c'est cher." />
        <PriceTable currentPhase={getCurrentPriceColumn(status)} />
      </section>
    </Container>
  );
}
