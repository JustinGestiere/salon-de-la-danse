import type { ReactNode } from "react";

type CountdownCardProps = {
  daysLeft: number;
  /// Bloc affiché à droite du compte à rebours (les places restantes).
  children?: ReactNode;
};

export function CountdownCard({ daysLeft, children }: CountdownCardProps) {
  return (
    <div className="flex flex-wrap items-stretch gap-x-7 gap-y-5 rounded-3xl border border-line-strong bg-raised px-6 py-5 shadow-[0_30px_80px_rgb(0_0_0/0.35)] sm:px-7">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-muted">Lever de rideau dans</span>
        <span className="font-display text-6xl leading-[0.9] text-ink sm:text-7xl">
          {daysLeft === 0 ? "Jour J" : `J-${daysLeft}`}
        </span>
      </div>
      {children ? (
        <>
          <div aria-hidden="true" className="hidden w-px bg-line-strong sm:block" />
          <div className="min-w-[200px] flex-1">{children}</div>
        </>
      ) : null}
    </div>
  );
}
