import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { WHY_NOT_YOU_HREF } from "@/components/layout/navigation";
import { CONTACT, EDITION } from "@/features/edition/content";
import { VisitModes } from "@/features/program/components/visit-modes";
import { DANCE_FAMILIES } from "@/features/program/content";

export const metadata: Metadata = {
  title: "Le Salon",
  description: "Le Salon de toutes les danses : classique, contemporain, urbain, jazz, danses du monde, de salon et cabaret, réunis trois jours à Angers.",
};

const KEY_FIGURES = [
  { id: "demonstrations", figure: "~100", label: "démonstrations" },
  { id: "exhibitors", figure: "~100", label: "exposants" },
  { id: "days", figure: "3", label: "jours, du vendredi au dimanche" },
  { id: "families", figure: String(DANCE_FAMILIES.length), label: "familles de danse" },
] as const;

export default function SalonPage() {
  return (
    <>
      <Container className="flex flex-col gap-14">
        <PageIntro kicker={`Édition ${EDITION.year}`} title="Le Salon de" emphasis="toutes les danses">
          <p>
            Faire d'Angers, le temps d'un week-end, le cœur battant de la danse française. Le Salon réunit tous les
            univers chorégraphiques, du ballet au breaking, pour les danseurs confirmés comme pour les curieux qui
            n'ont jamais osé.
          </p>
        </PageIntro>

        <ul className="grid grid-cols-2 border-t border-line-strong lg:grid-cols-4">
          {KEY_FIGURES.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 border-b border-line py-6 pr-4">
              <span className="font-display text-6xl leading-none text-accent">{item.figure}</span>
              <span className="text-muted">{item.label}</span>
            </li>
          ))}
        </ul>

        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading title="Un langage" emphasis="pour tout le monde" />
            <p className="text-lg leading-relaxed text-ink-soft">
              La danse parle à tous, sans barrière d'âge, d'origine, de niveau ni de genre. L'ouverture aux tendances
              et le mélange des influences font l'ADN du Salon : des musiques d'aujourd'hui, de la pop au K-pop en
              passant par le hip-hop et l'électro, et toutes les familles de danse sous le même toit.
            </p>
            <ul className="flex flex-wrap gap-2">
              {DANCE_FAMILIES.map((family) => (
                <li key={family} className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft">
                  {family}
                </li>
              ))}
            </ul>
            <ButtonLink href={WHY_NOT_YOU_HREF} variant="outline" className="self-start">
              Jamais dansé ? Par où commencer →
            </ButtonLink>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image
              src="/images/photos/troupe-scene.webp"
              alt="Une troupe de danseuses et de danseurs en plein spectacle"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>
      </Container>

      <section className="mt-20 border-t border-line">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading title="Trois façons de" emphasis="vivre le Salon" />
          <VisitModes />
        </Container>
      </section>

      <Container>
        <section className="grid gap-8 rounded-[32px] border border-line bg-surface p-6 sm:p-12 lg:grid-cols-2">
          <SectionHeading kicker="Qui sommes-nous" title="Une équipe," emphasis="des bénévoles" />
          <div className="flex flex-col gap-4 text-[17px] leading-relaxed text-ink-soft">
            <p>
              Le Salon est organisé par l'association {CONTACT.organizer}, née de JayDance Fitness, un concept de
              danse fitness créé en 2019 qui mêle chorégraphies modernes et entraînement intensif.
            </p>
            <p>
              Il est porté par une équipe de bénévoles, de salariés et de prestataires, avec une même envie : faire
              découvrir les arts chorégraphiques dans une ambiance où chacun se sent à sa place.
            </p>
          </div>
        </section>
      </Container>
    </>
  );
}
