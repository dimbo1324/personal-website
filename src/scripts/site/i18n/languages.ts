export type Language = "en" | "es" | "ru";

export interface LanguageInfo {
  readonly code: Language;
  readonly label: string;
  readonly name: string;
  readonly locale: string;
  readonly ogLocale: string;
}

export const LANGUAGES: readonly LanguageInfo[] = Object.freeze([
  Object.freeze({ code: "en", label: "EN", name: "English", locale: "en-US", ogLocale: "en_US" }),
  Object.freeze({ code: "es", label: "ES", name: "Español", locale: "es-UY", ogLocale: "es_UY" }),
  Object.freeze({ code: "ru", label: "RU", name: "Русский", locale: "ru-RU", ogLocale: "ru_RU" }),
]);

export const DEFAULT_LANGUAGE: Language = "en";

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "es" || value === "ru";
}

export function languageInfo(code: Language): LanguageInfo {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0]!;
}
