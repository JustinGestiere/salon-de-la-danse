import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export type PhotoFile = {
  body: Buffer;
  contentType: string;
};

/// Lit une photo d'identité du dossier de stockage. Le chemin vient de la base,
/// mais on vérifie quand même qu'il reste sous UPLOAD_DIR : une valeur altérée
/// ne doit pas permettre de lire un autre fichier du serveur.
export async function readVolunteerPhoto(photoPath: string): Promise<PhotoFile | null> {
  const uploadRoot = path.resolve(env.UPLOAD_DIR);
  const absolutePath = path.resolve(photoPath);
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) return null;

  const contentType = MIME_BY_EXTENSION[path.extname(absolutePath).toLowerCase()];
  if (!contentType) return null;

  try {
    return { body: await readFile(absolutePath), contentType };
  } catch (error) {
    console.error("[readVolunteerPhoto] fichier illisible", { photoPath, error });
    return null;
  }
}
