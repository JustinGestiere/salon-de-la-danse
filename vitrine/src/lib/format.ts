// Les dates sont stockées en UTC et converties uniquement à l'affichage, dans
// le fuseau de l'évènement.
export const EVENT_TIME_ZONE = "Europe/Paris";

const euroFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/// Montant en centimes vers « 13,50 € ». L'argent circule toujours en centimes.
export function formatEuros(amountInCents: number): string {
  return euroFormatter.format(amountInCents / 100);
}

/// « 14 avril 2027 ».
export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(value);
}

/// Nombre de places, « 1 840 ».
export function formatCount(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}
