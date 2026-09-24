import type { ReactNode } from "react";

import { FluentIcon } from "@/components/ui/fluent-icon";
import type { FluentIconName } from "@/components/ui/fluent-icon-data";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-6 ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ children, icon }: { children: ReactNode; icon?: FluentIconName }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 font-display text-2xl leading-none text-ink">
      {icon ? <FluentIcon name={icon} className="size-7" /> : null}
      {children}
    </h2>
  );
}
