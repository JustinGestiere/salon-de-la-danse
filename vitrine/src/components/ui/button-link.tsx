import type { ReactNode } from "react";
import Link from "next/link";

type ButtonLinkVariant = "primary" | "secondary" | "outline" | "inverse";

type ButtonLinkSize = "md" | "sm";

type ButtonLinkProps = {
  href: string;
  variant?: ButtonLinkVariant;
  size?: ButtonLinkSize;
  className?: string;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonLinkVariant, string> = {
  primary: "bg-sunset text-on-accent font-semibold shadow-[0_10px_30px_var(--site-glow)] hover:brightness-105",
  secondary: "border border-line-strong text-ink hover:bg-raised",
  outline: "border border-accent text-accent font-semibold hover:bg-raised",
  // Sur fond dégradé : bouton sombre, lisible dans les deux palettes.
  inverse: "bg-[#1a0f26] text-[#ffe3cc] font-semibold hover:brightness-125",
};

const SIZE_CLASSES: Record<ButtonLinkSize, string> = {
  md: "min-h-12 px-6 text-[15px] sm:min-h-14 sm:px-7 sm:text-base",
  sm: "min-h-11 px-5 text-[15px]",
};

/// Lien présenté comme un bouton : les appels à l'action naviguent, ils ne
/// déclenchent pas d'action (sinon, un vrai <button>).
export function ButtonLink({ href, variant = "primary", size = "md", className = "", children }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
