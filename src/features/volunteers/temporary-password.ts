import { randomInt } from "node:crypto";

// Sans caractères ambigus (l/1, O/0) : le mot de passe est dicté ou recopié.
const LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const ALL_CHARACTERS = `${LOWERCASE}${UPPERCASE}${DIGITS}`;

/// Au-dessus du minimum de 10 imposé à l'inscription.
export const TEMPORARY_PASSWORD_LENGTH = 14;

type PickIndex = (max: number) => number;

function pick(characters: string, pickIndex: PickIndex): string {
  return characters.charAt(pickIndex(characters.length));
}

/// Mot de passe provisoire remis par la régie. Il respecte les mêmes règles
/// qu'à l'inscription (minuscule, majuscule, chiffre). Le tirage vient de
/// crypto.randomInt ; il est injectable pour les tests.
export function generateTemporaryPassword(pickIndex: PickIndex = randomInt): string {
  const characters = [pick(LOWERCASE, pickIndex), pick(UPPERCASE, pickIndex), pick(DIGITS, pickIndex)];
  while (characters.length < TEMPORARY_PASSWORD_LENGTH) {
    characters.push(pick(ALL_CHARACTERS, pickIndex));
  }

  // Mélange de Fisher-Yates : les trois caractères imposés ne restent pas en tête.
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = pickIndex(index + 1);
    const current = characters[index] ?? "";
    characters[index] = characters[swapIndex] ?? "";
    characters[swapIndex] = current;
  }
  return characters.join("");
}
