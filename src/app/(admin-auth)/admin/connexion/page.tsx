import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { toQueryParams } from "@/lib/url";
import { AdminSignInForm } from "@/features/admin/components/admin-sign-in-form";
import { resolveAdminUser } from "@/features/admin/guards";
import { resolveAdminRedirect } from "@/features/admin/navigation";

export const metadata: Metadata = {
  title: "Connexion · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSignInPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([resolveAdminUser(), searchParams]);
  const redirectTo = resolveAdminRedirect(toQueryParams(params).suivant);
  if (user) redirect(redirectTo);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">
        Connexion <em className="text-muted">à la régie</em>
      </h1>
      <AdminSignInForm redirectTo={redirectTo} />
    </div>
  );
}
