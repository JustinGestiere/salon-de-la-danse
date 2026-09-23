"use client";

import type { GaugeState } from "@/features/planning/constants";
import type { BoardCell } from "@/features/planning/components/planning-board";

const GAUGE_STYLES: Record<GaugeState, string> = {
  free: "border-gauge-free/40 bg-green-50 text-green-800",
  tight: "border-gauge-tight/40 bg-orange-50 text-orange-800",
  full: "border-gray-300 bg-gray-100 text-gray-500",
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
      className={`flex min-h-16 flex-col items-start rounded-lg border p-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${
        isSelected
          ? "border-brand-600 bg-brand-600 text-white"
          : GAUGE_STYLES[cell.gauge]
      }`}
    >
      <span className="font-semibold">{missionName}</span>
      {missionLocation ? (
        <span className={isSelected ? "text-brand-100" : "text-current/70"}>{missionLocation}</span>
      ) : null}
      <span className="mt-1 text-xs">
        {isSelected
          ? "✓ Sélectionné"
          : isFull
            ? "Complet"
            : `${cell.remaining} place${cell.remaining > 1 ? "s" : ""}`}
      </span>
    </button>
  );
}
