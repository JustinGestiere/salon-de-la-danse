import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";

import { adminInputClass } from "@/components/admin/input-styles";

type AdminSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  function AdminSelect({ label, error, id, className = "", children, ...rest }, ref) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={adminInputClass(Boolean(error), className)}
          {...rest}
        >
          {children}
        </select>
        {error ? (
          <p id={`${selectId}-error`} className="text-xs font-medium text-danger-ink">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
