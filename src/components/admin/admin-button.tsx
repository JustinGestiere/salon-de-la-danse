import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

export type AdminButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type AdminButtonSize = "md" | "sm";

const VARIANT_CLASSES: Record<AdminButtonVariant, string> = {
  primary: "bg-sunset text-on-accent font-semibold shadow-[0_10px_30px_var(--admin-glow)] hover:brightness-105",
  secondary: "border border-line-strong text-ink hover:bg-raised",
  ghost: "text-muted hover:bg-raised hover:text-ink",
  danger: "border border-danger/60 text-danger-ink hover:bg-danger-soft",
};

const SIZE_CLASSES: Record<AdminButtonSize, string> = {
  md: "min-h-11 px-5 text-sm",
  sm: "min-h-9 px-3.5 text-xs",
};

type ButtonStyle = {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  className?: string;
};

/// Classes communes aux boutons et aux liens stylés en bouton du back-office.
export function adminButtonClass({
  variant = "secondary",
  size = "md",
  className = "",
}: ButtonStyle): string {
  return `inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
}

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyle & {
    isLoading?: boolean;
  };

export function AdminButton({
  variant,
  size,
  className,
  isLoading = false,
  disabled,
  type = "button",
  children,
  ...rest
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={adminButtonClass({ variant, size, className })}
      {...rest}
    >
      {isLoading ? "Un instant…" : children}
    </button>
  );
}

type AdminButtonLinkProps = ComponentProps<typeof Link> & ButtonStyle;

export function AdminButtonLink({
  variant,
  size,
  className,
  children,
  ...rest
}: AdminButtonLinkProps) {
  return (
    <Link className={adminButtonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
