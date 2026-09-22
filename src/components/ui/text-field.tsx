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
        <label htmlFor={inputId} className="text-sm font-medium text-gray-800">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`min-h-11 rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 ${
            error ? "border-red-400" : "border-gray-300"
          } ${className}`}
          {...rest}
        />
        {hint && !error ? (
          <p id={hintId} className="text-xs text-gray-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
