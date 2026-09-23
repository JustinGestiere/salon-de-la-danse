export type ExportCell = string | number;

export type ExportColumn = {
  header: string;
  /// Largeur de colonne dans le classeur Excel, en caractères.
  width: number;
};

/// Tableau neutre, construit une fois puis rendu en CSV ou en Excel.
export type ExportTable = {
  sheetName: string;
  columns: readonly ExportColumn[];
  rows: readonly (readonly ExportCell[])[];
};

export const EXPORT_FORMATS = ["xlsx", "csv"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/// Au-delà, la requête est refusée : une édition compte environ 130 bénévoles,
/// un volume supérieur trahit une erreur plutôt qu'un vrai besoin.
export const MAX_EXPORT_ROWS = 5000;
