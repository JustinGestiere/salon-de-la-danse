import type { Metadata } from "next";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié — Salon de la Danse" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 font-display text-3xl text-ink">
          <FluentIcon name="mail" className="size-8" />
          <span>
            Mot de passe <em className="text-muted">oublié</em>
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Indiquez votre adresse e-mail : nous vous enverrons un lien pour en choisir un nouveau.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
