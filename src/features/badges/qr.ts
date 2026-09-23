import QRCode from "qrcode";

/// Niveau M (15 % de redondance) : le badge peut être plié ou rayé sans que le
/// code devienne illisible, tout en restant assez simple pour une petite taille.
const ERROR_CORRECTION_LEVEL = "M";

/// Zone blanche obligatoire autour du code, en modules, pour que les lecteurs
/// le détectent.
export const QR_QUIET_ZONE = 2;

export type QrMatrix = {
  /// Côté du dessin, zone blanche comprise, en modules.
  size: number;
  /// Chemin SVG des modules noirs, un carré de 1 × 1 par module.
  path: string;
};

/// Code QR tracé en un seul chemin SVG : rendu par React sans injecter de
/// HTML, et net à toutes les tailles d'impression.
export function buildQrMatrix(text: string): QrMatrix {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: ERROR_CORRECTION_LEVEL });
  const commands: string[] = [];

  for (let row = 0; row < modules.size; row += 1) {
    for (let column = 0; column < modules.size; column += 1) {
      if (modules.get(row, column)) commands.push(`M${column + QR_QUIET_ZONE} ${row + QR_QUIET_ZONE}h1v1h-1z`);
    }
  }

  return { size: modules.size + QR_QUIET_ZONE * 2, path: commands.join("") };
}
