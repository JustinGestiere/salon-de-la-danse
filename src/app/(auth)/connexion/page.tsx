import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Connexion — Salon de la Danse" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">
        Connexion <em className="text-muted">à votre espace</em>
      </h1>
      <Suspense fallback={<p className="text-sm text-muted">Chargement…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
