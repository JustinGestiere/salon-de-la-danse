import type { ReactNode } from "react";

type AlertTone = "error" | "success" | "info" | "warning";

const TONE_CLASSES: Record<AlertTone, string> = {
  error: "bg-red-50 text-red-800 border-red-200",
  success: "bg-green-50 text-green-800 border-green-200",
  info: "bg-brand-50 text-brand-700 border-brand-200",
  warning: "bg-orange-50 text-orange-800 border-orange-200",
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
      className={`rounded-lg border px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}
    >
      {children}
    </div>
  );
}
