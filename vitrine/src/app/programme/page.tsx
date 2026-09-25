import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { EDITION, EDITION_DAYS, HOURS_NOTICE } from "@/features/edition/content";
import { ProgramSpaceList } from "@/features/program/components/program-space-list";
import { TicketsCta } from "@/features/tickets/components/tickets-cta";

export const metadata: Metadata = {
  title: "Programme",
  description: "Démonstrations, initiations, masterclass, conférences, clubbing et village des danses du monde : le programme du Salon, jour par jour et espace par espace.",
};

export default function ProgramPage() {
  return (
    <Container className="flex flex-col gap-16">
      <PageIntro kicker={EDITION.datesLabel} title="Le" emphasis="programme">
        <p>
          Le programme détaillé {EDITION.year}, démonstration par démonstration, sera publié à l'approche du Salon.
          Voici déjà les jours, les horaires et les espaces.
        </p>
      </PageIntro>

      <section className="flex flex-col gap-8">
        <SectionHeading title="Jour" emphasis="par jour" aside={HOURS_NOTICE} />
        <ol className="grid gap-5 md:grid-cols-3">
          {EDITION_DAYS.map((day) => (
            <li key={day.isoDate} className="flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lilac">{day.label}</p>
              <h3 className="font-display text-4xl leading-none text-ink">{day.title}</h3>
              <p className="font-display text-3xl italic text-accent">{day.hours}</p>
              <p className="leading-relaxed text-muted">{day.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading title="Espace" emphasis="par espace" />
        <ProgramSpaceList />
      </section>

      <TicketsCta
        title="Masterclass et initiations :"
        emphasis="à vous de jouer."
        description="Le billet donne accès aux démonstrations, aux initiations, aux stands et aux conférences gratuites. Les masterclass se réservent en plus."
        buttonLabel="Choisir mes billets"
      />
    </Container>
  );
}
