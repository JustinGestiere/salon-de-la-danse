/// Règles métier du planning bénévole, en fonctions pures : aucune dépendance à
/// la base ni au réseau, donc testables unitairement et réutilisables côté
/// client (retour immédiat) comme côté serveur (source de vérité).

export type SlotRules = {
  minSlots: number;
  maxSlots: number;
  /// Nombre maximal de créneaux consécutifs (même jour, positions qui se
  /// suivent) autorisé sans pause.
  maxConsecutive: number;
};

/// Une case sélectionnée, réduite à ce dont les règles ont besoin.
export type SelectedCell = {
  missionSlotId: string;
  timeSlotId: string;
  /// Jour au format ISO court (AAAA-MM-JJ), pour regrouper par journée.
  eventDate: string;
  /// Rang du créneau dans la journée (1..n).
  position: number;
};

export type RuleViolation = {
  code:
    | "tooFew"
    | "tooMany"
    | "overlap"
    | "tooManyConsecutive";
  message: string;
};

/// Vérifie qu'aucun créneau n'accueille deux missions.
function findOverlap(cells: readonly SelectedCell[]): RuleViolation | null {
  const seen = new Set<string>();
  for (const cell of cells) {
    if (seen.has(cell.timeSlotId)) {
      return {
        code: "overlap",
        message: "Vous ne pouvez pas prendre deux missions sur le même créneau.",
      };
    }
    seen.add(cell.timeSlotId);
  }
  return null;
}

/// Longueur du plus long enchaînement de créneaux consécutifs, tous jours
/// confondus (une pause en fin de journée coupe l'enchaînement).
function longestConsecutiveRun(cells: readonly SelectedCell[]): number {
  const positionsByDate = new Map<string, number[]>();
  for (const cell of cells) {
    const list = positionsByDate.get(cell.eventDate) ?? [];
    list.push(cell.position);
    positionsByDate.set(cell.eventDate, list);
  }

  let longest = 0;
  for (const positions of positionsByDate.values()) {
    const sorted = [...positions].sort((a, b) => a - b);
    let run = 0;
    let previous: number | null = null;
    for (const position of sorted) {
      run = previous !== null && position === previous + 1 ? run + 1 : 1;
      previous = position;
      if (run > longest) longest = run;
    }
  }
  return longest;
}

/// Valide une sélection complète. Utilisée pour le retour temps réel du
/// brouillon et comme dernier rempart avant le verrouillage.
export function validateSelection(
  cells: readonly SelectedCell[],
  rules: SlotRules,
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  if (cells.length < rules.minSlots) {
    violations.push({
      code: "tooFew",
      message: `Choisissez au moins ${rules.minSlots} créneau${rules.minSlots > 1 ? "x" : ""}.`,
    });
  }
  if (cells.length > rules.maxSlots) {
    violations.push({
      code: "tooMany",
      message: `Vous ne pouvez pas dépasser ${rules.maxSlots} créneaux.`,
    });
  }

  const overlap = findOverlap(cells);
  if (overlap) violations.push(overlap);

  if (longestConsecutiveRun(cells) > rules.maxConsecutive) {
    violations.push({
      code: "tooManyConsecutive",
      message: `Pas plus de ${rules.maxConsecutive} créneaux d'affilée sans pause.`,
    });
  }

  return violations;
}

/// Peut-on ajouter cette case à la sélection courante ? Sert au blocage en
/// temps réel dans la grille (avant même d'appeler le serveur).
export function canAddCell(
  current: readonly SelectedCell[],
  candidate: SelectedCell,
  rules: SlotRules,
): RuleViolation | null {
  if (current.some((cell) => cell.missionSlotId === candidate.missionSlotId)) {
    return null;
  }
  const next = [...current, candidate];

  if (next.length > rules.maxSlots) {
    return {
      code: "tooMany",
      message: `Vous ne pouvez pas dépasser ${rules.maxSlots} créneaux.`,
    };
  }
  const overlap = findOverlap(next);
  if (overlap) return overlap;

  if (longestConsecutiveRun(next) > rules.maxConsecutive) {
    return {
      code: "tooManyConsecutive",
      message: `Pas plus de ${rules.maxConsecutive} créneaux d'affilée sans pause.`,
    };
  }
  return null;
}
