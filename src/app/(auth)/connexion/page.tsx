import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Connexion — Salon de la Danse" };

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Chargement…</p>}>
      <LoginForm />
    </Suspense>
  );
}
