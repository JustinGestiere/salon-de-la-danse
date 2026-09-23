import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker: string;
  title: string;
  /// Fin du titre en italique, la touche « danse » de la direction artistique.
  emphasis?: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ kicker, title, emphasis, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex max-w-3xl flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-subtle">{kicker}</p>
        <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl">
          {title}
          {emphasis ? (
            <>
              {" "}
              <em className="text-accent-strong">{emphasis}</em>
            </>
          ) : null}
        </h1>
        {description ? <p className="text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
