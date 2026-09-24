import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { icons } from "@iconify-json/fluent-color";

// Seules ces icônes du jeu Fluent Color (MIT, Microsoft) sont embarquées : le
// jeu complet pèse 1,7 Mo et finirait dans le JavaScript envoyé au navigateur.
// Pour en ajouter une : l'ajouter ici, puis `npm run icons:generate`.
// Catalogue : https://icon-sets.iconify.design/fluent-color/
const ICON_NAMES = [
  "book-contacts",
  "calendar",
  "checkmark-circle",
  "clipboard-task",
  "contact-card",
  "document-text",
  "error-circle",
  "history",
  "home",
  "laptop",
  "lightbulb",
  "lock-shield",
  "mail",
  "people-team",
  "person-add",
  "person-key",
  "settings",
  "text-bullet-list-square",
  "warning",
  "weather-sunny-low",
] as const;

/// Variante dessinée pour 24 px : la plus lisible entre 16 et 32 px affichés.
const ICON_VARIANT_SIZE = 24;

const OUTPUT_PATH = fileURLToPath(new URL("../src/components/ui/fluent-icon-data.ts", import.meta.url));

function buildEntry(name: string): string {
  const icon = icons.icons[`${name}-${ICON_VARIANT_SIZE}`];
  if (!icon) throw new Error(`Icône introuvable dans fluent-color : ${name}-${ICON_VARIANT_SIZE}`);
  const width = icon.width ?? icons.width ?? ICON_VARIANT_SIZE;
  const height = icon.height ?? icons.height ?? ICON_VARIANT_SIZE;
  return `  ${JSON.stringify(name)}: { width: ${width}, height: ${height}, body: ${JSON.stringify(icon.body)} },`;
}

const content = `// Fichier généré par scripts/generate-fluent-icons.ts : ne pas modifier à la main.
// Icônes Fluent Color (Microsoft, licence MIT), via @iconify-json/fluent-color.

export type FluentIconData = { width: number; height: number; body: string };

export const FLUENT_ICON_DATA = {
${ICON_NAMES.map(buildEntry).join("\n")}
} as const satisfies Record<string, FluentIconData>;

export type FluentIconName = keyof typeof FLUENT_ICON_DATA;
`;

writeFileSync(OUTPUT_PATH, content);
console.info(`${ICON_NAMES.length} icônes écrites dans ${OUTPUT_PATH}`);
