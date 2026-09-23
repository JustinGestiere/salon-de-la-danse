"use client";

type StepperProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  unit?: string;
};

/// Réglage numérique par pas de un. Plus sûr qu'un champ libre pour de petites
/// valeurs bornées (quotas, jauges) : impossible de saisir hors limites.
export function Stepper({ label, value, min, max, onChange, disabled = false, unit }: StepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Diminuer : ${label}`}
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        className="grid size-11 place-items-center rounded-full border border-line-strong text-lg text-ink transition hover:bg-raised disabled:opacity-40"
      >
        −
      </button>
      <output aria-live="polite" className="min-w-14 text-center font-display text-3xl text-accent-strong">
        {value}
        {unit ? <span className="text-base"> {unit}</span> : null}
      </output>
      <button
        type="button"
        aria-label={`Augmenter : ${label}`}
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className="grid size-11 place-items-center rounded-full border border-line-strong text-lg text-ink transition hover:bg-raised disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
