import { computeGaugeState } from "@/features/planning/constants";

/// Niveau de remplissage affiché dans les vues d'ensemble de la régie. Reprend
/// les états de jauge du planning bénévole (libre, tendu, complet) et isole en
/// plus les cases encore peu remplies, que la régie cherche à combler.
export type HeatLevel = "low" | "free" | "tight" | "full";

/// Sous ce taux de remplissage, une case libre est signalée « peu remplie ».
export const LOW_FILL_RATIO = 0.4;

export function computeHeatLevel(filled: number, capacity: number): HeatLevel {
  const gauge = computeGaugeState(capacity - filled, capacity);
  if (gauge !== "free") return gauge;
  return filled / capacity < LOW_FILL_RATIO ? "low" : "free";
}

export function computeFillRate(filled: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.round((filled / capacity) * 100);
}

type GridCellCounts = {
  missionId: string;
  filled: number;
  capacity: number;
  isOpen: boolean;
};

export type SeatTotals = {
  filled: number;
  capacity: number;
};

/// Places prises et offertes sur les missions réservables par les bénévoles.
/// Les postes sensibles sont exclus : leur remplissage dépend de la régie, pas
/// des inscriptions. Une case surbookée par dérogation ne compte pas au-delà de
/// sa jauge.
export function sumPublicSeats(
  cells: readonly GridCellCounts[],
  sensitiveMissionIds: ReadonlySet<string>,
): SeatTotals {
  let filled = 0;
  let capacity = 0;
  for (const cell of cells) {
    if (!cell.isOpen || sensitiveMissionIds.has(cell.missionId)) continue;
    filled += Math.min(cell.filled, cell.capacity);
    capacity += cell.capacity;
  }
  return { filled, capacity };
}

export function computePublicFillRate(
  cells: readonly GridCellCounts[],
  sensitiveMissionIds: ReadonlySet<string>,
): number {
  const totals = sumPublicSeats(cells, sensitiveMissionIds);
  return computeFillRate(totals.filled, totals.capacity);
}

export type GridAlerts = {
  fullPublicSlots: number;
  emptySensitiveSlots: number;
};

/// Points d'attention de la grille pour la liste « À régler » de la régie.
export function countGridAlerts(
  cells: readonly GridCellCounts[],
  sensitiveMissionIds: ReadonlySet<string>,
): GridAlerts {
  let fullPublicSlots = 0;
  let emptySensitiveSlots = 0;
  for (const cell of cells) {
    if (!cell.isOpen) continue;
    const isSensitive = sensitiveMissionIds.has(cell.missionId);
    if (isSensitive && cell.filled === 0) emptySensitiveSlots += 1;
    if (!isSensitive && cell.filled >= cell.capacity) fullPublicSlots += 1;
  }
  return { fullPublicSlots, emptySensitiveSlots };
}
