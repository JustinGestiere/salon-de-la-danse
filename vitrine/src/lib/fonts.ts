import { Instrument_Sans, Instrument_Serif } from "next/font/google";

// Polices du thème « crépuscule », les mêmes que la régie et l'espace bénévole.
export const displayFont = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-site-display",
});

export const sansFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-site-sans",
});

export const THEME_FONT_VARIABLES = `${displayFont.variable} ${sansFont.variable}`;
