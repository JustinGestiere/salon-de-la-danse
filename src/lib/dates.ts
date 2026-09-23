/// Jour d'une colonne PostgreSQL DATE au format AAAA-MM-JJ. Prisma renvoie ces
/// dates à minuit UTC : on lit donc le jour en UTC, sans conversion de fuseau,
/// sinon Paris afficherait parfois la veille.
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
