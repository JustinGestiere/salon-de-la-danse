type CountdownHeroProps = {
  daysLeft: number | null;
  startLabel: string | null;
  lockedCount: number;
  volunteerCount: number;
  filledSeats: number;
  totalSeats: number;
  registrationLabel: string;
};

/// En-tête de la vue d'ensemble : le compte à rebours et l'état de la troupe en
/// une phrase, plutôt qu'une rangée de compteurs.
export function CountdownHero({
  daysLeft,
  startLabel,
  lockedCount,
  volunteerCount,
  filledSeats,
  totalSeats,
  registrationLabel,
}: CountdownHeroProps) {
  return (
    <section
      aria-label="Compte à rebours"
      className="relative flex flex-col gap-8 overflow-hidden rounded-[28px] border border-line bg-surface px-8 py-10 sm:px-12 lg:flex-row lg:items-center lg:gap-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,var(--admin-glow)_0%,transparent_68%)]"
      />
      {/* La courbe reste dans la marge basse : elle ne doit jamais passer sous le texte. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1328 240"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 -bottom-3 h-14 w-full text-accent opacity-30"
      >
        <path d="M -20 200 C 220 120, 420 250, 640 170 S 1020 40, 1360 90" fill="none" stroke="currentColor" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="relative flex shrink-0 flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">Lever de rideau dans</p>
        <p className="font-display text-8xl leading-[0.9] tracking-tight text-ink sm:text-9xl">
          {daysLeft === null ? "…" : `J-${daysLeft}`}
        </p>
        <p className="text-sm text-muted">{startLabel ?? "La grille des créneaux n'est pas encore créée."}</p>
      </div>

      <div className="relative flex max-w-2xl flex-col gap-3">
        <p className="font-display text-3xl leading-snug text-ink sm:text-4xl">
          <em className="text-accent">{lockedCount} bénévoles</em> sur {volunteerCount} ont validé leur
          planning, et <em className="text-accent">{filledSeats} places</em> sur {totalSeats} sont déjà
          prises.
        </p>
        <p className="text-sm text-muted">{registrationLabel}</p>
      </div>
    </section>
  );
}
