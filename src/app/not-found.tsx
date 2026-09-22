import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Page introuvable</h1>
      <p className="text-gray-600">La page demandée n'existe pas ou a été déplacée.</p>
      <Link
        href="/tableau-de-bord"
        className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Retour au tableau de bord
      </Link>
    </main>
  );
}
