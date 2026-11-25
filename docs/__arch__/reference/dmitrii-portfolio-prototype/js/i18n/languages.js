/** Languages the site is translated into. The first one is the fallback. */
export const LANGUAGES = Object.freeze([
  Object.freeze({ code: "en", label: "EN", name: "English", locale: "en-US", ogLocale: "en_US" }),
  Object.freeze({ code: "es", label: "ES", name: "Español", locale: "es-UY", ogLocale: "es_UY" }),
  Object.freeze({ code: "ru", label: "RU", name: "Русский", locale: "ru-RU", ogLocale: "ru_RU" }),
]);

export const DEFAULT_LANGUAGE = LANGUAGES[0].code;

export const isSupportedLanguage = (code) => LANGUAGES.some((language) => language.code === code);

export const languageInfo = (code) => LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0];
