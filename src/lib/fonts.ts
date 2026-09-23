import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";

// Polices du thème « crépuscule », partagées par la régie et l'espace bénévole.
// Les pages hors thème (impressions bénévole, pages légales) gardent les leurs.
export const displayFont = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-admin-display",
});

export const sansFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-admin-sans",
});

export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-admin-mono",
});

export const THEME_FONT_VARIABLES = `${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`;
