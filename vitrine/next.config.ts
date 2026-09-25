import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La vitrine vit dans le dépôt de l'app bénévoles, qui a son propre
  // package-lock.json : sans racine explicite, Next prendrait le dossier parent.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
