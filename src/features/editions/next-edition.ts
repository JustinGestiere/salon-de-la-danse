import type { CreateEditionInput } from "@/features/editions/admin-schemas";
import { DEFAULT_EDITION_NAME } from "@/features/editions/constants";
import { addDaysToIsoDate, utcToZonedLocalInput } from "@/features/editions/dates";

/// 52 semaines exactement : le salon garde le même jour de la semaine d'une
/// année sur l'autre (vendredi, samedi, dimanche).
const DAYS_IN_52_WEEKS = 364;
const MAX_SLUG_LENGTH = 60;
const YEAR_PATTERN = /\b\d{4}\b/;
/// Sans édition modèle : inscriptions ouvertes dès aujourd'hui et closes deux
/// semaines avant le salon, le temps de figer les plannings et d'imprimer.
const FIRST_EDITION_CLOSE_DAYS_BEFORE_EVENT = 14;
const DEFAULT_OPENING_TIME = "09:00";
const DEFAULT_CLOSING_TIME = "23:59";

export type NextEditionSource = {
  name: string;
  firstDay: string | null;
  opensAt: Date;
  closesAt: Date;
};

function shiftLocalInput(date: Date): string {
  const local = utcToZonedLocalInput(date);
  return `${addDaysToIsoDate(local.slice(0, 10), DAYS_IN_52_WEEKS)}${local.slice(10)}`;
}

function renameForYear(name: string, year: string): string {
  return YEAR_PATTERN.test(name) ? name.replace(YEAR_PATTERN, year) : `${name} ${year}`;
}

export function toEditionSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

/// Valeurs proposées pour préparer l'édition suivante : mêmes jours de la
/// semaine un an plus tard, même fenêtre d'inscription, contenus repris.
export function suggestNextEdition(source: NextEditionSource, today: string): CreateEditionInput {
  const firstDay = addDaysToIsoDate(source.firstDay ?? today, DAYS_IN_52_WEEKS);
  const name = renameForYear(source.name, firstDay.slice(0, 4));
  return {
    name,
    slug: toEditionSlug(name),
    firstDay,
    opensAt: shiftLocalInput(source.opensAt),
    closesAt: shiftLocalInput(source.closesAt),
    copyGrid: true,
    copyWelcome: true,
    archiveCurrent: true,
  };
}

/// Valeurs proposées quand aucune édition ne sert de modèle.
export function suggestFirstEdition(today: string): CreateEditionInput {
  const firstDay = addDaysToIsoDate(today, DAYS_IN_52_WEEKS);
  const name = `${DEFAULT_EDITION_NAME} ${firstDay.slice(0, 4)}`;
  const closingDay = addDaysToIsoDate(firstDay, -FIRST_EDITION_CLOSE_DAYS_BEFORE_EVENT);
  return {
    name,
    slug: toEditionSlug(name),
    firstDay,
    opensAt: `${today}T${DEFAULT_OPENING_TIME}`,
    closesAt: `${closingDay}T${DEFAULT_CLOSING_TIME}`,
    copyGrid: false,
    copyWelcome: false,
    archiveCurrent: false,
  };
}
