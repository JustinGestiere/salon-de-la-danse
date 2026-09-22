"use client";

import { useEffect } from "react";

/// Déclenche la boîte d'impression du navigateur (« Enregistrer en PDF ») au
/// chargement de la page d'export.
export function AutoPrint() {
  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mb-4 rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 print:hidden"
    >
      Imprimer / enregistrer en PDF
    </button>
  );
}
