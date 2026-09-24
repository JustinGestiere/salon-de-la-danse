import { useId } from "react";

import { FLUENT_ICON_DATA, type FluentIconName } from "@/components/ui/fluent-icon-data";
import { prefixSvgIds, toSvgIdPrefix } from "@/components/ui/fluent-icon-ids";

type FluentIconProps = {
  name: FluentIconName;
  /// Taille et placement (classes Tailwind). 20 px par défaut.
  className?: string;
};

/// Icône multicolore du jeu Fluent Color, intégrée en SVG sans appel réseau.
/// Toujours décorative : le texte voisin porte le sens.
export function FluentIcon({ name, className = "size-5" }: FluentIconProps) {
  const idPrefix = toSvgIdPrefix(useId());
  const icon = FLUENT_ICON_DATA[name];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      className={`shrink-0 ${className}`}
      // Contenu sûr : le corps vient du fichier généré à partir du paquet
      // d'icônes, jamais d'une donnée saisie par un utilisateur.
      dangerouslySetInnerHTML={{ __html: prefixSvgIds(icon.body, idPrefix) }}
    />
  );
}
