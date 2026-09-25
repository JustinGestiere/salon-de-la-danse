import type { ReactNode } from "react";

import { SectionHeading } from "@/components/ui/section-heading";

type PageIntroProps = {
  kicker: string;
  title: string;
  emphasis?: string;
  children?: ReactNode;
};

/// En-tête des pages intérieures : titre de page (h1) et chapeau.
export function PageIntro({ kicker, title, emphasis, children }: PageIntroProps) {
  return (
    <header className="relative flex flex-col gap-6 pb-4 pt-12 sm:pt-20">
      <SectionHeading as="h1" kicker={kicker} title={title} emphasis={emphasis} />
      {children ? <div className="max-w-2xl text-lg leading-relaxed text-ink-soft">{children}</div> : null}
    </header>
  );
}
