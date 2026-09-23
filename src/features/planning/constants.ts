export type GaugeState = "free" | "tight" | "full";

/// En dessous de ce ratio de places restantes, la jauge passe en « tendu »
/// (orange). À zéro place, elle est « complète » (gris).
export const GAUGE_TIGHT_RATIO = 0.34;

export function computeGaugeState(remaining: number, capacity: number): GaugeState {
  if (remaining <= 0 || capacity <= 0) return "full";
  if (remaining / capacity <= GAUGE_TIGHT_RATIO) return "tight";
  return "free";
}
