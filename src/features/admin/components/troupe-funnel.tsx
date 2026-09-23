import Link from "next/link";

export type FunnelSegment = {
  key: string;
  label: string;
  hint: string;
  value: number;
  href: string;
  barClassName: string;
  valueClassName: string;
};

/// Parcours de la troupe, du code d'invitation au planning validé, en une seule
/// barre : les proportions se lisent d'un coup d'œil.
export function TroupeFunnel({ segments }: { segments: readonly FunnelSegment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <section aria-labelledby="troupe-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="troupe-title" className="font-display text-3xl text-ink">
          La troupe{" "}
          <span className="font-admin text-sm text-subtle">du code d'invitation au planning validé</span>
        </h2>
        <Link href="/admin/benevoles" className="text-sm font-medium text-accent hover:underline">
          Tous les bénévoles →
        </Link>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted">Personne n'a encore été invité.</p>
      ) : (
        <>
          <div className="flex h-3 gap-1">
            {segments.map((segment) =>
              segment.value > 0 ? (
                <Link
                  key={segment.key}
                  href={segment.href}
                  aria-label={`${segment.value} : ${segment.label}`}
                  style={{ flexGrow: segment.value }}
                  className={`block basis-0 rounded-full ${segment.barClassName}`}
                />
              ) : null,
            )}
          </div>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {segments.map((segment) => (
              <div key={segment.key} className="flex flex-col gap-1">
                <dt className="order-2 text-sm font-semibold text-ink">{segment.label}</dt>
                <dd className={`order-1 font-display text-5xl leading-none ${segment.valueClassName}`}>
                  {segment.value}
                </dd>
                <dd className="order-3 text-xs text-subtle">{segment.hint}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
