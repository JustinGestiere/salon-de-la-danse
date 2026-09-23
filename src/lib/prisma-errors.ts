import { Prisma } from "@/generated/prisma/client";

/// Violation d'une contrainte d'unicité (P2002) : e-mail déjà pris, nom de
/// mission ou slug d'édition en double. Erreur attendue, traduite en message.
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
