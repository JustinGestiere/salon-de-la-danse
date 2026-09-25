import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TICKETS_HREF, WHY_NOT_YOU_HREF } from "@/components/layout/navigation";
import { FactsList } from "@/features/dance-styles/components/facts-list";
import { CountdownCard } from "@/features/edition/components/countdown-card";
import { WeekendCard } from "@/features/edition/components/weekend-card";
import { EDITION } from "@/features/edition/content";
import { getDaysUntil } from "@/features/edition/countdown";
import { GuestNameList } from "@/features/guests/components/guest-name-list";
import { GUESTS_EDITION_YEAR, getFeaturedGuests } from "@/features/guests/content";
import { VisitModes } from "@/features/program/components/visit-modes";
import { SeatsGauge } from "@/features/tickets/components/seats-gauge";
import { TicketsCta } from "@/features/tickets/components/tickets-cta";
import { getSeatAvailabilityForDisplay } from "@/features/tickets/queries";

export default async function HomePage() {
  const seatAvailability = await getSeatAvailabilityForDisplay();
  const daysLeft = getDaysUntil(EDITION.openingDate, new Date());

  return (
    <>
      <div aria-hidden="true" className="bg-glow pointer-events-none absolute -right-56 -top-64 size-[820px] rounded-full" />

      <Container className="relative grid gap-12 pb-20 pt-12 sm:pt-20 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="flex flex-col justify-center gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted sm:text-[13px]">
            {EDITION.datesLabel} · Centre de Congrès d'Angers
          </p>
          <h1 className="font-display text-6xl leading-[0.95] text-ink sm:text-8xl lg:text-[104px]">
            Le week-end où <em className="text-accent">tout Angers</em> danse.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft sm:text-[19px]">
            Classique, breaking, salsa, krump, ori tahiti, électro… Une centaine de démonstrations, des initiations
            ouvertes à tous et des masterclass avec des pointures nationales. Que vous veniez regarder, essayer ou
            vous dépasser.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={TICKETS_HREF}>Réserver mes billets</ButtonLink>
            <ButtonLink href="/programme" variant="secondary">Voir le programme</ButtonLink>
          </div>
        </div>
        <div className="relative flex flex-col gap-5 lg:block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] lg:aspect-auto lg:h-[576px]">
            <Image
              src="/images/photos/troupe-scene.webp"
              alt="Une troupe de danseuses et de danseurs en plein spectacle"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="lg:absolute lg:-bottom-9 lg:-left-10 lg:max-w-[calc(100%+40px)]">
            <CountdownCard daysLeft={daysLeft}>
              {seatAvailability ? <SeatsGauge availability={seatAvailability} /> : null}
            </CountdownCard>
          </div>
        </div>
      </Container>

      <section className="border-t border-line">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            title="Trois façons de"
            emphasis="vivre le Salon"
            aside={<Link href="/programme" className="font-medium text-accent hover:underline">Tout le programme →</Link>}
          />
          <VisitModes />
        </Container>
      </section>

      <Container>
        <section className="relative grid gap-10 overflow-hidden rounded-[32px] border border-line-strong bg-surface p-6 sm:p-12 lg:grid-cols-2 lg:gap-14 lg:p-16">
          <div aria-hidden="true" className="bg-glow-lilac pointer-events-none absolute -bottom-56 -left-40 size-[560px] rounded-full" />
          <div className="relative flex flex-col justify-center gap-6">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-lilac-ink">Pourquoi pas vous ?</p>
            <h2 className="font-display text-5xl leading-none text-ink sm:text-6xl">
              Battles, portés, freezes : <em className="text-accent">la piste vous attend aussi.</em>
            </h2>
            <p className="text-[17px] leading-relaxed text-ink-soft">
              Technique, endurance, compétition : la danse est un sport complet. Venez voir les battles, testez une
              initiation entre amis, finissez la soirée à l'espace clubbing avec DJ Roxs.
            </p>
            <FactsList />
            <ButtonLink href={WHY_NOT_YOU_HREF} variant="outline" className="self-start">
              Par où commencer →
            </ButtonLink>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-3xl lg:min-h-[560px]">
            <Image
              src="/images/photos/breaker-freeze.webp"
              alt="Un breaker en freeze, en équilibre sur une main"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>
      </Container>

      <Container className="flex flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          kicker={`Ils et elles étaient là en ${GUESTS_EDITION_YEAR}`}
          title="Nos"
          emphasis="invités"
          aside={
            <p>
              Les invités {EDITION.year} seront annoncés ici.{" "}
              <Link href="/invites" className="font-medium text-accent hover:underline">Tous les invités →</Link>
            </p>
          }
        />
        <GuestNameList guests={getFeaturedGuests()} />
      </Container>

      <Container className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TicketsCta
            kicker={`Billetterie ${EDITION.year}`}
            title="Un jour ou le week-end,"
            emphasis="gala du dimanche compris."
            description="Pass Découverte 1 jour ou Pass Passion 2 jours, tarif réduit pour les scolaires, les moins de 25 ans et les demandeurs d'emploi. Gratuit pour les moins de 6 ans. Paiement sécurisé par carte."
            buttonLabel="Choisir mes billets"
          />
        </div>
        <WeekendCard linkHref="/infos-pratiques" linkLabel="Accès et parkings" />
      </Container>
    </>
  );
}
