import Link from "next/link";

import { SETTINGS_TABS, SETTINGS_TAB_LABELS, type SettingsTab } from "@/features/editions/admin-schemas";

type SettingsTabsProps = {
  activeTab: SettingsTab;
  /// Onglets affichés : sans édition active, seul « Éditions » a du sens.
  tabs?: readonly SettingsTab[];
};

export function SettingsTabs({ activeTab, tabs = SETTINGS_TABS }: SettingsTabsProps) {
  return (
    <nav aria-label="Sections des réglages" className="flex gap-8 overflow-x-auto border-b border-line">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Link
            key={tab}
            href={`/admin/reglages?onglet=${tab}`}
            aria-current={isActive ? "page" : undefined}
            scroll={false}
            className={`relative flex min-h-12 shrink-0 items-center text-[15px] transition ${
              isActive ? "font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {SETTINGS_TAB_LABELS[tab]}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${isActive ? "bg-sunset" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
