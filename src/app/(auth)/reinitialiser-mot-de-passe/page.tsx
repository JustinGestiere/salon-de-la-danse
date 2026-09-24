import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { FluentIcon } from "@/components/ui/fluent-icon";
import { toQueryParams } from "@/lib/url";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { FORGOT_PASSWORD_PATH } from "@/features/auth/redirects";

export const metadata: Metadata = { title: "Nouveau mot de passe — Salon de la Danse" };

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = toQueryParams(await searchParams);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-3 font-display text-3xl text-ink">
        <FluentIcon name="lock-shield" className="size-8" />
        <span>
          Nouveau <em className="text-muted">mot de passe</em>
        </span>
      </h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col gap-5">
          <Alert tone="error">
            Ce lien est incomplet. Ouvrez le lien reçu par e-mail tel quel, ou demandez-en un nouveau.
          </Alert>
          <Link
            href={FORGOT_PASSWORD_PATH}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Demander un nouveau lien
          </Link>
        </div>
      )}
    </div>
  );
}
