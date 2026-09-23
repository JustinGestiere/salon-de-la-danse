import type { ExportTable } from "@/features/exports/table";

/// Rendu imprimable d'un tableau d'export : mêmes colonnes que le fichier
/// Excel, pour que papier et tableur disent la même chose.
export function PrintTable({ table }: { table: ExportTable }) {
  return (
    <table className="w-full border-collapse text-[9pt] leading-snug">
      <thead>
        <tr className="border-b-2 border-ink text-left">
          {table.columns.map((column) => (
            <th key={column.header} scope="col" className="px-1.5 py-2 font-semibold">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row) => (
          <tr key={row.join("|")} className="break-inside-avoid border-b border-line">
            {row.map((cell, index) => (
              <td key={table.columns[index]?.header ?? index} className="px-1.5 py-1.5 align-top">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
