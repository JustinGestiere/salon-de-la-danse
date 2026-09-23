import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { toQueryParams } from "@/lib/url";
import { requireAdmin } from "@/features/admin/guards";
import { SETTINGS_TABS, settingsParamsSchema, type SettingsTab } from "@/features/editions/admin-schemas";
import { EditionSettings } from "@/features/editions/components/edition-settings";
import { MissionSettings } from "@/features/editions/components/mission-settings";
import { RegistrationSettings } from "@/features/editions/components/registration-settings";
import { SettingsTabs } from "@/features/editions/components/settings-tabs";
import { WelcomeForm } from "@/features/editions/components/welcome-form";
import { getActiveEdition, type ActiveEdition } from "@/features/editions/queries";

export const metadata: Metadata = {
  title: "Réglages · Régie du Salon de la Danse",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/// Sans édition active, seul l'onglet « Éditions » a du sens : il sert à en créer une.
const TABS_WITHOUT_EDITION: readonly SettingsTab[] = ["editions"];

function renderTab(tab: SettingsTab, edition: ActiveEdition) {
  switch (tab) {
    case "inscriptions":
      return <RegistrationSettings edition={edition} />;
    case "missions":
      return <MissionSettings editionId={edition.id} />;
    case "accueil":
      return (
        <WelcomeForm
          editionName={edition.name}
          initialValues={{
            rulesMarkdown: edition.rulesMarkdown ?? "",
            contactEmail: edition.contactEmail ?? "",
            contactPhone: edition.contactPhone ?? "",
          }}
        />
      );
    case "editions":
      return <EditionSettings activeEditionId={edition.id} />;
  }
}

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const [edition, params] = await Promise.all([getActiveEdition(), searchParams]);
  const query = settingsParamsSchema.parse(toQueryParams(params));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="Les coulisses"
        title="Réglages"
        emphasis={edition?.name}
        description={edition ? undefined : "Aucune édition en cours : créez-en une pour ouvrir les inscriptions."}
      />
      <SettingsTabs activeTab={edition ? query.onglet : "editions"} tabs={edition ? SETTINGS_TABS : TABS_WITHOUT_EDITION} />
      {edition ? renderTab(query.onglet, edition) : <EditionSettings activeEditionId={null} />}
    </div>
  );
}
