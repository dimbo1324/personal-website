import { I18nService } from "../i18n/I18nService.js";
import { resolveInitialLanguage } from "../i18n/resolveInitialLanguage.js";
import { SafeStorage } from "../core/SafeStorage.js";
import en from "../i18n/locales/en.js";
import es from "../i18n/locales/es.js";
import ru from "../i18n/locales/ru.js";

/** Builds the translation service with the visitor's starting language. */
export function createI18n() {
  const storage = new SafeStorage("dp");
  const initial = resolveInitialLanguage({
    search: window.location.search,
    stored: storage.read("lang"),
    preferred: navigator.languages ?? [navigator.language],
  });
  return new I18nService({ dictionaries: { en, es, ru }, initial, storage, storageKey: "lang" });
}
