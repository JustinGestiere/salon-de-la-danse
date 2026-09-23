import type { ReactNode } from "react";

export type StatusTone = "ok" | "warn" | "danger" | "lilac" | "neutral" | "accent";

const TONE_CLASSES: Record<StatusTone, string> = {
  ok: "bg-ok-soft text-ok-ink",
  warn: "bg-warn-soft text-warn-ink",
  danger: "bg-danger-soft text-danger-ink",
  lilac: "bg-lilac-soft text-lilac-ink",
  neutral: "bg-raised text-muted",
  accent: "bg-raised text-accent",
};

const DOT_CLASSES: Record<StatusTone, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  lilac: "bg-lilac",
  neutral: "bg-subtle",
  accent: "bg-accent",
};

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
};

/// Pastille d'état : la couleur est doublée d'un libellé, l'information ne
/// repose jamais sur la couleur seule.
export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${DOT_CLASSES[tone]}`} />
      {children}
    </span>
  );
}
