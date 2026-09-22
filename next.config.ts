import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
  experimental: {
    // Server Actions gèrent l'upload de la photo d'identité (multipart).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
