import { ButtonLink } from "@/components/ui/button-link";
import { TICKETS_HREF } from "@/components/layout/navigation";

type TicketsCtaProps = {
  kicker?: string;
  title: string;
  emphasis: string;
  description: string;
  buttonLabel: string;
};

/// Bandeau dégradé qui renvoie vers la billetterie. Texte sombre sur le
/// dégradé, dans les deux palettes.
export function TicketsCta({ kicker, title, emphasis, description, buttonLabel }: TicketsCtaProps) {
  return (
    <section className="bg-sunset flex flex-col gap-6 rounded-[32px] p-8 text-[#1a0f26] sm:p-12 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex max-w-3xl flex-col gap-4">
        {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.22em]">{kicker}</p> : null}
        <h2 className="font-display text-4xl leading-none sm:text-6xl">
          {title} <em>{emphasis}</em>
        </h2>
        <p className="text-[17px] leading-relaxed">{description}</p>
      </div>
      <ButtonLink href={TICKETS_HREF} variant="inverse" className="shrink-0 self-start lg:self-center">
        {buttonLabel}
      </ButtonLink>
    </section>
  );
}
