import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Salon de la Danse
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Espace bénévole</h1>
      </header>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </main>
  );
}
