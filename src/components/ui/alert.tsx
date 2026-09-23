import type { ReactNode } from "react";

type AlertTone = "error" | "success" | "info" | "warning";

const TONE_CLASSES: Record<AlertTone, string> = {
  error: "bg-danger-soft text-danger-ink",
  success: "bg-ok-soft text-ok-ink",
  info: "bg-lilac-soft text-lilac-ink",
  warning: "bg-warn-soft text-warn-ink",
};

export function Alert({
  tone = "info",
  children,
}: {
  tone?: AlertTone;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${TONE_CLASSES[tone]}`}
    >
      {children}
    </div>
  );
}
