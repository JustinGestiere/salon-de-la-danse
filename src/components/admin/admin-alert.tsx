import type { ReactNode } from "react";

type AdminAlertTone = "error" | "success" | "info" | "warning";

const TONE_CLASSES: Record<AdminAlertTone, string> = {
  error: "bg-danger-soft text-danger-ink",
  success: "bg-ok-soft text-ok-ink",
  info: "bg-lilac-soft text-lilac-ink",
  warning: "bg-warn-soft text-warn-ink",
};

export function AdminAlert({
  tone = "info",
  children,
}: {
  tone?: AdminAlertTone;
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
