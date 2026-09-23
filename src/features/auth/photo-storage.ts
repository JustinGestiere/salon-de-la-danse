import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import type { AcceptedPhotoMimeType } from "@/features/auth/constants";

const EXTENSION_BY_MIME: Record<AcceptedPhotoMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/// Écrit la photo d'identité sur le disque serveur, hors du repo et hors de
/// public/ : elle n'est jamais servie statiquement ni stockée en base. Renvoie
/// le chemin relatif enregistré dans volunteer.photoPath.
export async function storeVolunteerPhoto(
  volunteerId: string,
  file: File,
): Promise<string> {
  const extension = EXTENSION_BY_MIME[file.type as AcceptedPhotoMimeType] ?? "bin";
  const fileName = `${volunteerId}.${extension}`;

  // UPLOAD_DIR n'est connu qu'à l'exécution : sans ces commentaires, le
  // traçage du build ne peut pas délimiter le dossier et embarque tout le
  // projet dans le bundle serveur, fichier .env compris.
  const uploadDir = path.join(/* turbopackIgnore: true */ env.UPLOAD_DIR);
  const photoPath = path.join(/* turbopackIgnore: true */ uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(photoPath, buffer);

  return photoPath;
}
