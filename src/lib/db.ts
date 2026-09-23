import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

// Prisma 7 : un driver adapter est obligatoire. L'URL vient de l'env valide.
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Un seul PrismaClient : en dev, chaque hot reload recreerait un client et
// ouvrirait de nouvelles connexions. On le memorise donc sur globalThis.
// Le cast est sûr : globalThis n'a pas de propriété prisma dans son type, on
// la déclare ici et elle n'est lue ou écrite que par ce module.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
