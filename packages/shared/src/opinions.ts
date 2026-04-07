import type { ZmanimOpinion, ZmanimPreferences } from "./types";

export interface OpinionConfig {
  id: ZmanimOpinion;
  label: string;
  hebrewLabel: string;
  description: string;
}

export const ZMANIM_OPINIONS: OpinionConfig[] = [
  {
    id: "gra",
    label: "GRA (Vilna Gaon)",
    hebrewLabel: "\u05D2\u05E8\"\u05D0",
    description:
      "Day is calculated from sunrise (hanetz) to sunset (shkia), divided into 12 equal hours.",
  },
  {
    id: "mga",
    label: "Magen Avraham",
    hebrewLabel: "\u05DE\u05D2\"\u05D0",
    description:
      "Day is calculated from alos hashachar (72 min before sunrise) to tzeis hakochavim (72 min after sunset).",
  },
  {
    id: "rabbeinuTam",
    label: "Rabbeinu Tam",
    hebrewLabel: "\u05E8\u05D1\u05D9\u05E0\u05D5 \u05EA\u05DD",
    description:
      "Nightfall (tzeis) occurs 72 minutes after sunset, based on the time it takes to walk 4 mil.",
  },
];

export const DEFAULT_PREFERENCES: ZmanimPreferences = {
  opinion: "gra",
  candleLightingMinutes: 18,
  showSeconds: false,
  use24Hour: false,
};
