import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { WeekendCard } from "@/features/edition/components/weekend-card";
import { CONTACT, HOURS_NOTICE, VENUE } from "@/features/edition/content";
import { ACCESSIBILITY_FACTS, ACCESSIBILITY_SOURCE_URL, FAQ, VISIT_RULES } from "@/features/edition/practical-info";

export const metadata: Metadata = {
  title: "Infos pratiques",
  description: "Adresse, tram, parkings, horaires, accessibilité et règles d'accueil du Salon de la Danse au Centre de Congrès d'Angers.",
};

export default function PracticalInfoPage() {
  return (
    <Container className="flex flex-col gap-16">
      <PageIntro kicker="Venir au Salon" title="Infos" emphasis="pratiques" />

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-[32px] border border-line bg-surface p-8 sm:p-10 lg:col-span-2">
          <h2 className="font-display text-4xl leading-none text-ink">Accès</h2>
          <address className="not-italic text-lg text-ink">
            {VENUE.name}
            <br />
            {VENUE.street}, {VENUE.city}
          </address>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-lilac">Tram</dt>
              <dd className="text-muted">{VENUE.tram}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-lilac">Parking gratuit</dt>
              <dd className="text-muted">{VENUE.freeParking}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-lilac">Parkings payants à proximité</dt>
              <dd className="text-muted">{VENUE.paidParkings.join(", ")}</dd>
            </div>
          </dl>
        </div>
        <WeekendCard showHours />
      </section>
      <p className="-mt-12 text-sm text-subtle">{HOURS_NOTICE}</p>

      <section className="flex flex-col gap-8">
        <SectionHeading title="Bon" emphasis="à savoir" />
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {VISIT_RULES.map((rule) => (
            <li key={rule.id} className="flex flex-col gap-2 rounded-[28px] border border-line bg-surface p-7">
              <h3 className="text-lg font-semibold text-ink">{rule.title}</h3>
              <p className="leading-relaxed text-muted">{rule.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionHeading title="Accessibilité" />
          <ul className="flex flex-col border-t border-line-strong">
            {ACCESSIBILITY_FACTS.map((fact) => (
              <li key={fact} className="border-b border-line py-4 text-ink-soft">{fact}</li>
            ))}
          </ul>
          <a href={ACCESSIBILITY_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="self-start text-sm text-accent hover:underline">
            Fiche complète sur Acceslibre →
          </a>
        </div>
        <div className="flex flex-col gap-6">
          <SectionHeading title="Questions" emphasis="fréquentes" />
          <div className="flex flex-col border-t border-line-strong">
            {FAQ.map((item) => (
              <details key={item.id} className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {item.question}
                  <span aria-hidden="true" className="text-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="pt-3 leading-relaxed text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[32px] border border-line bg-surface p-8 sm:p-10">
        <h2 className="font-display text-4xl leading-none text-ink">Une question ?</h2>
        <p className="text-muted">
          Appelez le <a href={CONTACT.phoneHref} className="font-medium text-accent hover:underline">{CONTACT.phone}</a> ou
          écrivez à <a href={`mailto:${CONTACT.email}`} className="font-medium text-accent hover:underline">{CONTACT.email}</a>.
        </p>
      </section>
    </Container>
  );
}
