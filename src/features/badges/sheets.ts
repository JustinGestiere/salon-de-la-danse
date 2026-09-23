/// Planche A4 portrait (210 × 297 mm) : 2 colonnes × 4 rangées de badges de
/// 105 × 74 mm, sans marge perdue.
export const BADGES_PER_SHEET = 8;

export function splitIntoSheets<TItem>(items: readonly TItem[], perSheet: number = BADGES_PER_SHEET): TItem[][] {
  const sheets: TItem[][] = [];
  for (let index = 0; index < items.length; index += perSheet) {
    sheets.push(items.slice(index, index + perSheet));
  }
  return sheets;
}
