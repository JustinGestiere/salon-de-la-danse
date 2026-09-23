export type RegistrationTimelineInput = {
  now: Date;
  opensAt: Date;
  closesAt: Date;
  eventStart: Date | null;
};

export type RegistrationTimeline = {
  /// Positions en pourcentage de la largeur de la frise.
  todayPercent: number;
  opensPercent: number;
  closesPercent: number;
  eventPercent: number;
};

/// Marge laissée de chaque côté de la frise pour que les repères ne collent pas
/// aux bords.
const EDGE_MARGIN_PERCENT = 6;

/// Place aujourd'hui, l'ouverture, la fermeture et le salon sur une même frise,
/// proportionnellement au temps qui les sépare.
export function computeRegistrationTimeline(input: RegistrationTimelineInput): RegistrationTimeline {
  const eventTime = (input.eventStart ?? input.closesAt).getTime();
  const points = [input.now.getTime(), input.opensAt.getTime(), input.closesAt.getTime(), eventTime];
  const start = Math.min(...points);
  const end = Math.max(...points);
  const span = Math.max(end - start, 1);
  const usable = 100 - EDGE_MARGIN_PERCENT * 2;
  const toPercent = (time: number): number => Math.round(EDGE_MARGIN_PERCENT + ((time - start) / span) * usable);

  return {
    todayPercent: toPercent(input.now.getTime()),
    opensPercent: toPercent(input.opensAt.getTime()),
    closesPercent: toPercent(input.closesAt.getTime()),
    eventPercent: toPercent(eventTime),
  };
}
