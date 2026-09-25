import type { ReactNode } from "react";

type SectionHeadingProps = {
  kicker?: string;
  title: string;
  /// Fin du titre en italique, la touche « danse » de la direction artistique.
  emphasis?: string;
  /// Texte ou lien aligné à droite du titre sur grand écran.
  aside?: ReactNode;
  as?: "h1" | "h2";
};

const TITLE_SIZES = {
  h1: "text-5xl sm:text-7xl lg:text-8xl leading-[0.95]",
  h2: "text-4xl sm:text-5xl leading-none",
} as const;

export function SectionHeading({ kicker, title, emphasis, aside, as: Title = "h2" }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div className="flex flex-col gap-3">
        {kicker ? (
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">{kicker}</p>
        ) : null}
        <Title className={`font-display text-ink ${TITLE_SIZES[Title]}`}>
          {title}
          {emphasis ? (
            <>
              {" "}
              <em className="text-accent">{emphasis}</em>
            </>
          ) : null}
        </Title>
      </div>
      {aside ? <div className="shrink-0 text-[15px] text-muted lg:max-w-sm lg:text-right">{aside}</div> : null}
    </div>
  );
}
