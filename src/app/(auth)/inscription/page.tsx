import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Inscription — Salon de la Danse" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">
        Rejoindre <em className="text-muted">la troupe</em>
      </h1>
      <RegisterForm />
    </div>
  );
}
