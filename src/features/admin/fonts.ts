import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";

// Polices du back-office uniquement : l'espace bénévole garde les siennes.
export const adminDisplayFont = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-admin-display",
});

export const adminSansFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-admin-sans",
});

export const adminMonoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-admin-mono",
});

export const ADMIN_FONT_VARIABLES = `${adminDisplayFont.variable} ${adminSansFont.variable} ${adminMonoFont.variable}`;
