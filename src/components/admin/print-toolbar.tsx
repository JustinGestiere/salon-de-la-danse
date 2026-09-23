"use client";

import { AdminButton } from "@/components/admin/admin-button";

type PrintToolbarProps = {
  title: string;
  summary: string;
};

/// Barre d'outils des pages imprimables, masquée à l'impression. Le PDF
/// s'obtient avec « Enregistrer au format PDF » de la boîte d'impression.
export function PrintToolbar({ title, summary }: PrintToolbarProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface/95 px-6 py-4 backdrop-blur print:hidden">
      <div className="flex flex-col">
        <span className="font-display text-2xl text-ink">{title}</span>
        <span className="text-xs text-muted">{summary}</span>
      </div>
      <AdminButton variant="primary" onClick={() => window.print()}>
        Imprimer ou enregistrer en PDF
      </AdminButton>
    </div>
  );
}
