import { SafeStorage } from "../core/storage";
import { I18nService, resolveInitialLanguage } from "../i18n/service";
import en from "../i18n/locales/en";
import es from "../i18n/locales/es";
import ru from "../i18n/locales/ru";

/** Builds the translation service with the visitor's starting language. */
export function createI18n(): I18nService {
  const storage = new SafeStorage("dp");
  const initial = resolveInitialLanguage({
    search: window.location.search,
    stored: storage.read("lang"),
    preferred: navigator.languages ?? [navigator.language],
  });
  return new I18nService({ dictionaries: { en, es, ru }, initial, storage, storageKey: "lang" });
}
