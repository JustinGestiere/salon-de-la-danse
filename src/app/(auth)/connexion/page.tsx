import { Suspense } from "react";
import type { Metadata } from "next";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Connexion — Salon de la Danse" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-3 font-display text-3xl text-ink">
        <FluentIcon name="person-key" className="size-8" />
        <span>
          Connexion <em className="text-muted">à votre espace</em>
        </span>
      </h1>
      <Suspense fallback={<p className="text-sm text-muted">Chargement…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
