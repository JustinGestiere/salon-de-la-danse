import type { Metadata } from "next";

import { FluentIcon } from "@/components/ui/fluent-icon";
import { toQueryParams } from "@/lib/url";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Inscription — Salon de la Danse" };

/// Longueur maximale acceptée pour préremplir le code depuis le lien de
/// l'e-mail : au-delà, ce n'est pas un code d'invitation.
const MAX_PREFILLED_CODE_LENGTH = 32;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const { code } = toQueryParams(await searchParams);
  const prefilledCode = code && code.length <= MAX_PREFILLED_CODE_LENGTH ? code.trim() : "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-3 font-display text-3xl text-ink">
        <FluentIcon name="person-add" className="size-8" />
        <span>
          Rejoindre <em className="text-muted">la troupe</em>
        </span>
      </h1>
      <RegisterForm defaultInvitationCode={prefilledCode} />
    </div>
  );
}
