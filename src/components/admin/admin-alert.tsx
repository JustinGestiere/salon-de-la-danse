import type { ReactNode } from "react";

import { FluentIcon } from "@/components/ui/fluent-icon";
import type { FluentIconName } from "@/components/ui/fluent-icon-data";

type AdminAlertTone = "error" | "success" | "info" | "warning";

const TONE_CLASSES: Record<AdminAlertTone, string> = {
  error: "bg-danger-soft text-danger-ink",
  success: "bg-ok-soft text-ok-ink",
  info: "bg-lilac-soft text-lilac-ink",
  warning: "bg-warn-soft text-warn-ink",
};

const TONE_ICONS: Record<AdminAlertTone, FluentIconName> = {
  error: "error-circle",
  success: "checkmark-circle",
  info: "lightbulb",
  warning: "warning",
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
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed ${TONE_CLASSES[tone]}`}
    >
      <FluentIcon name={TONE_ICONS[tone]} className="mt-px size-5" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
