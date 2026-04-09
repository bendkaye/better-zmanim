export const LANGUAGES = {
  en: "en",
  he: "he",
  translit: "translit",
} as const;

export type Language = keyof typeof LANGUAGES;

export interface I18nLabels {
  en: string;
  he: string;
  translit: string;
}
