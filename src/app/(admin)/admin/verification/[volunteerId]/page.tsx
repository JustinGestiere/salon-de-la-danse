import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminButtonLink } from "@/components/admin/admin-button";
import { requireAdmin } from "@/features/admin/guards";
import { VerificationCard } from "@/features/badges/components/verification-card";
import { getBadgeVerification } from "@/features/badges/queries";
import { utcToZonedLocalInput } from "@/features/editions/dates";
import { getActiveEdition } from "@/features/editions/queries";

export const metadata: Metadata = {
  title: "Vérification de badge · Régie du Salon de la Danse",
};

type PageProps = {
  params: Promise<{ volunteerId: string }>;
};

/// Cible du QR code imprimé sur les badges. Réservée à la régie connectée : un
/// passant qui scanne un badge perdu ne voit rien.
export default async function BadgeVerificationPage({ params }: PageProps) {
  await requireAdmin();
  const [{ volunteerId }, edition] = await Promise.all([params, getActiveEdition()]);
  if (!edition) notFound();

  const verification = await getBadgeVerification(edition.id, volunteerId);
  if (!verification) notFound();

  return (
    <div className="flex flex-col items-center gap-6">
      <VerificationCard
        verification={verification}
        editionName={edition.name}
        today={utcToZonedLocalInput(new Date()).slice(0, 10)}
      />
      <AdminButtonLink href={`/admin/benevoles?benevole=${verification.id}`} variant="ghost" size="sm">
        Ouvrir la fiche complète
      </AdminButtonLink>
    </div>
  );
}
