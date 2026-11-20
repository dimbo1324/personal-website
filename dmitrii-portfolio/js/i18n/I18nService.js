import { Store } from "../core/Store.js";
import { DEFAULT_LANGUAGE, LANGUAGES, isSupportedLanguage, languageInfo } from "./languages.js";
import { interpolate } from "./interpolate.js";
import { selectPlural } from "./selectPlural.js";
import { localize } from "./localize.js";

/**
 * Translation service.
 *
 * Messages live in flat dictionaries ("hero.status": "Open to work…").
 * A message may be a plain string with {placeholders} or a plural map
 * ({ one, few, many, other }) chosen by vars.count.
 * Lookup order: current language → English → the key itself, so a missing
 * translation degrades to English instead of an empty element.
 */
export class I18nService {
  #store;
  #dictionaries;
  #storage;
  #storageKey;

  /**
   * @param {{ dictionaries: Record<string, Record<string, string | Record<string, string>>>,
   *           initial: string,
   *           storage?: import("../core/SafeStorage.js").SafeStorage,
   *           storageKey?: string }} options
   */
  constructor({ dictionaries, initial, storage = null, storageKey = "lang" }) {
    this.#dictionaries = dictionaries;
    this.#storage = storage;
    this.#storageKey = storageKey;
    this.#store = new Store({ lang: isSupportedLanguage(initial) ? initial : DEFAULT_LANGUAGE });
  }

  /** @returns {string} */
  get lang() {
    return this.#store.get("lang");
  }

  get locale() {
    return languageInfo(this.lang).locale;
  }

  get languages() {
    return LANGUAGES;
  }

  /** @param {string} key  @param {Record<string, unknown>} [vars]  @returns {string} */
  t(key, vars) {
    /** @type {string | Record<string, string>} */
    const message = this.#lookup(this.lang, key) ?? this.#lookup(DEFAULT_LANGUAGE, key) ?? key;
    const text = typeof message === "string" ? message : selectPlural(message, Number(vars?.count ?? 0), this.locale);
    return interpolate(text, vars);
  }

  /** Whether the key exists in the current language or the fallback. */
  has(key) {
    return this.#lookup(this.lang, key) != null || this.#lookup(DEFAULT_LANGUAGE, key) != null;
  }

  /** Picks the current language from a { en, es, ru } value (or returns a plain string). */
  pick(value) {
    return localize(value, this.lang);
  }

  /** Locale-aware number formatting ("2,500" / "2.500" / "2 500"). */
  number(value, options) {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  set(lang) {
    if (!isSupportedLanguage(lang)) return;
    this.#store.set("lang", lang);
    this.#storage?.write(this.#storageKey, lang);
  }

  /**
   * @param {(lang: string, previous: string | undefined) => void} listener
   * @param {{ immediate?: boolean }} [options]
   * @returns {() => void}
   */
  subscribe(listener, options) {
    return this.#store.subscribe("lang", listener, options);
  }

  #lookup(lang, key) {
    return this.#dictionaries[lang]?.[key];
  }
}
