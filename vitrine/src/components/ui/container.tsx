import type { ReactNode } from "react";

/// Largeur de lecture commune à toutes les pages.
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16 ${className}`}>{children}</div>;
}
