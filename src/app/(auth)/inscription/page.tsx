import type { Metadata } from "next";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Inscription — Salon de la Danse" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-3 font-display text-3xl text-ink">
        <FluentIcon name="person-add" className="size-8" />
        <span>
          Rejoindre <em className="text-muted">la troupe</em>
        </span>
      </h1>
      <RegisterForm />
    </div>
  );
}
