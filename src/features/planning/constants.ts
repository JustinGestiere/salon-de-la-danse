export type GaugeState = "free" | "tight" | "full";

/// En dessous de ce ratio de places restantes, la jauge passe en « tendu »
/// (orange). À zéro place, elle est « complète » (gris).
export const GAUGE_TIGHT_RATIO = 0.34;

/// Nombre de jours et de créneaux attendus dans la grille (14, 15, 16 mai
/// 2027 × 5 créneaux de 2h). Sert aux vérifications de cohérence et au seed.
export const EXPECTED_DAYS = 3;
export const EXPECTED_SLOTS_PER_DAY = 5;

export function computeGaugeState(remaining: number, capacity: number): GaugeState {
  if (remaining <= 0 || capacity <= 0) return "full";
  if (remaining / capacity <= GAUGE_TIGHT_RATIO) return "tight";
  return "free";
}
