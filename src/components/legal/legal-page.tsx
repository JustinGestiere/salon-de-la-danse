import type { ReactNode } from "react";
import Link from "next/link";

/// Mise en page commune aux pages légales : lisible, centrée, sans dépendre de
/// l'espace connecté (elles sont accessibles avant l'inscription).
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/inscription" className="text-sm font-semibold text-brand-700">
        ← Retour à l'inscription
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
      <div className="prose prose-sm mt-4 flex flex-col gap-4 text-gray-700">{children}</div>
    </main>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-gray-900">{heading}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
