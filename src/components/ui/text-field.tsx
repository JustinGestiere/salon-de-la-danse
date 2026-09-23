import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

/// Champ de formulaire accessible : label toujours lié, erreur annoncée.
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, hint, id, className = "", ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`min-h-11 w-full rounded-2xl border bg-canvas px-4 py-2 text-sm text-ink placeholder:text-subtle disabled:opacity-60 ${
            error ? "border-danger" : "border-line-strong"
          } ${className}`}
          {...rest}
        />
        {hint && !error ? (
          <p id={hintId} className="text-xs text-subtle">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs font-medium text-danger-ink">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
