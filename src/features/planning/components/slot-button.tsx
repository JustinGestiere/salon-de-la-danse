"use client";

import { FluentIcon } from "@/components/ui/fluent-icon";
import type { GaugeState } from "@/features/planning/constants";
import type { BoardCell } from "@/features/planning/components/planning-board";

const GAUGE_STYLES: Record<GaugeState, string> = {
  free: "border-ok/40 bg-ok-soft text-ok-ink hover:border-ok",
  tight: "border-warn/40 bg-warn-soft text-warn-ink hover:border-warn",
  full: "border-line bg-raised text-subtle",
};

const GAUGE_DOTS: Record<GaugeState, string> = {
  free: "bg-ok",
  tight: "bg-warn",
  full: "bg-subtle",
};

type SlotButtonProps = {
  cell: BoardCell;
  missionName: string;
  missionLocation: string | null;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (cell: BoardCell) => void;
};

/// Une case de la grille : mission, lieu et places restantes (jamais les noms
/// des autres bénévoles).
export function SlotButton({
  cell,
  missionName,
  missionLocation,
  isSelected,
  isDisabled,
  onToggle,
}: SlotButtonProps) {
  const isFull = cell.remaining <= 0 && !isSelected;
  return (
    <button
      type="button"
      onClick={() => onToggle(cell)}
      disabled={isDisabled || isFull}
      aria-pressed={isSelected}
      className={`flex min-h-16 flex-col items-start rounded-2xl border p-3 text-left text-sm transition disabled:cursor-not-allowed ${
        isSelected
          ? "bg-sunset border-transparent text-on-accent shadow-[0_10px_30px_var(--admin-glow)]"
          : GAUGE_STYLES[cell.gauge]
      }`}
    >
      <span className="font-semibold">{missionName}</span>
      {missionLocation ? <span className="opacity-80">{missionLocation}</span> : null}
      <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs">
        {isSelected ? (
          <FluentIcon name="checkmark-circle" className="size-4" />
        ) : (
          <span aria-hidden="true" className={`size-1.5 rounded-full ${GAUGE_DOTS[cell.gauge]}`} />
        )}
        {isSelected
          ? "Sélectionné"
          : isFull
            ? "Complet"
            : `${cell.remaining} place${cell.remaining > 1 ? "s" : ""}`}
      </span>
    </button>
  );
}
