import type { UseFormRegisterReturn } from "react-hook-form";

type QuantityStepperProps = {
  /// Id du libellé de l'offre, pour nommer le champ et les boutons.
  labelId: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  inputProps: UseFormRegisterReturn;
  className?: string;
};

const STEP_BUTTON = "grid size-11 place-items-center rounded-full border border-line-strong text-xl text-ink transition hover:bg-surface disabled:opacity-40";

/// Quantité avec boutons − et +, saisie directe possible.
export function QuantityStepper({ labelId, value, max, onChange, inputProps, className = "" }: QuantityStepperProps) {
  return (
    <div role="group" aria-labelledby={labelId} className={`flex items-center gap-2 ${className}`}>
      <button type="button" aria-label="Retirer un billet" disabled={value <= 0} onClick={() => onChange(value - 1)} className={STEP_BUTTON}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        aria-labelledby={labelId}
        className="h-11 w-14 rounded-2xl border border-line-strong bg-surface text-center text-lg text-ink [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        {...inputProps}
      />
      <button type="button" aria-label="Ajouter un billet" disabled={value >= max} onClick={() => onChange(value + 1)} className={STEP_BUTTON}>
        +
      </button>
    </div>
  );
}
