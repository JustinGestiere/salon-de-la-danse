import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FirstVisitSteps } from "@/features/dance-styles/components/first-visit-steps";
import { MythGrid } from "@/features/dance-styles/components/myth-grid";
import { RoleModelList } from "@/features/dance-styles/components/role-model-list";
import { StyleGrid } from "@/features/dance-styles/components/style-grid";
import { GUESTS_EDITION_YEAR } from "@/features/guests/content";
import { TicketsCta } from "@/features/tickets/components/tickets-cta";

export const metadata: Metadata = {
  title: "Pourquoi pas vous ?",
  description:
    "Breaking, électro, salsa, danses bretonnes : la danse est aussi votre terrain. Idées reçues, styles à essayer et parcours pour un premier Salon.",
};

export default function WhyNotYouPage() {
  return (
    <>
      <div aria-hidden="true" className="bg-glow-lilac pointer-events-none absolute -left-64 -top-72 size-[860px] rounded-full" />

      <Container className="relative grid items-center gap-10 pb-16 pt-12 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-20">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-lilac-ink sm:text-[13px]">Pourquoi pas vous ?</p>
          <h1 className="font-display text-6xl leading-[0.94] text-ink sm:text-8xl lg:text-[112px]">
            La danse, c'est aussi <em className="text-accent">votre terrain.</em>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            Au Salon, il y a autant de freezes que de pointes. Si vous n'avez jamais osé, ou si vous accompagnez
            quelqu'un « juste pour voir », voici par où commencer.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#styles">Trouver mon style</ButtonLink>
            <ButtonLink href="#premier-salon" variant="secondary">Mon premier Salon</ButtonLink>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] lg:col-span-5 lg:aspect-auto lg:h-[600px]">
          <Image
            src="/images/photos/danseur-equilibre.webp"
            alt="Un danseur en équilibre sur les mains, jambes pliées"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </Container>

      <section className="border-t border-line">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading title="Les idées reçues," emphasis="une par une" />
          <MythGrid />
        </Container>
      </section>

      <section id="styles" className="scroll-mt-24 border-t border-line">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            title="Trouvez"
            emphasis="votre style"
            aside="Tous ces styles sont présents au Salon, en démonstration, en initiation ou sur les stands des écoles."
          />
          <StyleGrid />
        </Container>
      </section>

      <Container>
        <section
          id="premier-salon"
          className="relative flex scroll-mt-24 flex-col gap-10 overflow-hidden rounded-[32px] border border-line-strong bg-surface p-6 sm:p-12 lg:p-16"
        >
          <div aria-hidden="true" className="bg-glow pointer-events-none absolute -right-44 -top-56 size-[560px] rounded-full" />
          <div className="relative">
            <SectionHeading kicker="Votre premier Salon" title="De spectateur à danseur," emphasis="en une journée" />
          </div>
          <div className="relative">
            <FirstVisitSteps />
          </div>
        </section>
      </Container>

      <Container className="grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:gap-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] lg:col-span-4">
          <Image
            src="/images/guests/jordan-mouillerac.webp"
            alt="Jordan Mouillerac"
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover object-top"
          />
        </div>
        <div className="flex flex-col gap-7 lg:col-span-7 lg:col-start-6">
          <SectionHeading kicker={`Invités ${GUESTS_EDITION_YEAR}`} title="Ils ont tous commencé" emphasis="quelque part" />
          <RoleModelList />
          <Link href="/invites" className="self-start font-medium text-accent hover:underline">Tous les invités →</Link>
        </div>
      </Container>

      <Container>
        <TicketsCta
          title="Venez à plusieurs,"
          emphasis="repartez danseurs."
          description="Billet à la journée ou pour le week-end, tarif réduit pour les étudiants."
          buttonLabel="Prendre mes billets"
        />
      </Container>
    </>
  );
}
