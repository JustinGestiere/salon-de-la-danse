import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { EDITION } from "@/features/edition/content";
import { GuestCard } from "@/features/guests/components/guest-card";
import { GUESTS, GUESTS_EDITION_YEAR } from "@/features/guests/content";

export const metadata: Metadata = {
  title: "Invités",
  description: `Champions, chorégraphes et artistes invités au Salon de la Danse d'Angers en ${GUESTS_EDITION_YEAR}.`,
};

export default function GuestsPage() {
  return (
    <Container className="flex flex-col gap-14">
      <PageIntro kicker={`Ils et elles étaient là en ${GUESTS_EDITION_YEAR}`} title="Nos" emphasis="invités">
        <p>
          Masterclass, échanges avec le public, démonstrations : retour sur les invités de l'édition{" "}
          {GUESTS_EDITION_YEAR}. Les invités {EDITION.year} seront annoncés sur cette page.
        </p>
      </PageIntro>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {GUESTS.map((guest) => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </Container>
  );
}
