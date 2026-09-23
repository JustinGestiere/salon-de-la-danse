import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

import { adminInputClass } from "@/components/admin/input-styles";

type AdminTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

/// Champ du back-office : label toujours lié, erreur annoncée au lecteur d'écran.
export const AdminTextField = forwardRef<HTMLInputElement, AdminTextFieldProps>(
  function AdminTextField({ label, error, hint, id, className = "", ...rest }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={adminInputClass(Boolean(error), className)}
          {...rest}
        />
        {hint && !error ? (
          <p id={`${inputId}-hint`} className="text-xs text-subtle">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${inputId}-error`} className="text-xs font-medium text-danger-ink">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
