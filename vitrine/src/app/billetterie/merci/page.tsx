import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { WHY_NOT_YOU_HREF } from "@/components/layout/navigation";
import { formatEuros } from "@/lib/format";
import { EDITION } from "@/features/edition/content";
import { getOrderConfirmation } from "@/features/tickets/queries";
import { checkoutSessionIdSchema } from "@/features/tickets/schemas";

export const metadata: Metadata = {
  title: "Merci",
  robots: { index: false },
};

type ThankYouPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { session_id: rawSessionId } = await searchParams;
  const sessionId = checkoutSessionIdSchema.safeParse(rawSessionId);
  if (!sessionId.success) notFound();

  const order = await getOrderConfirmation(sessionId.data);
  if (!order) notFound();

  return (
    <Container className="flex max-w-3xl flex-col gap-10">
      <PageIntro kicker="Paiement confirmé" title="Merci, à très vite" emphasis="sur la piste !">
        <p>
          Votre commande pour le Salon de la Danse {EDITION.year} est réglée.
          {order.email ? ` Le reçu part à ${order.email}.` : null}
        </p>
      </PageIntro>

      <section className="flex flex-col gap-4 rounded-[28px] border border-line bg-surface p-7">
        <h2 className="font-display text-3xl text-ink">Votre commande</h2>
        <ul className="flex flex-col">
          {order.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4 border-b border-line py-3 text-ink-soft">
              <span>{line.quantity} × {line.description}</span>
              <span className="tabular-nums">{formatEuros(line.totalInCents)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between gap-4 text-lg font-semibold text-ink">
          <span>Total payé</span>
          <span className="tabular-nums">{formatEuros(order.totalInCents)}</span>
        </p>
      </section>

      <p className="text-ink-soft">
        Présentez votre reçu à l'accueil du Salon : on vous remet votre bracelet.
      </p>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/programme">Voir le programme</ButtonLink>
        <ButtonLink href={WHY_NOT_YOU_HREF} variant="secondary">Préparer ma première initiation</ButtonLink>
      </div>
    </Container>
  );
}
