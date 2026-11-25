import { Store } from "../core/store";
import type { SafeStorage } from "../core/storage";
import { DEFAULT_LANGUAGE, LANGUAGES, isSupportedLanguage, languageInfo } from "./languages";
import type { Language, LanguageInfo } from "./languages";
import { interpolate, localize, selectPlural } from "./types";
import type { Dictionary, LocalizedText, Message, MessageVars } from "./types";

interface I18nOptions {
  dictionaries: Readonly<Record<Language, Dictionary>>;
  initial: string;
  storage?: SafeStorage | null;
  storageKey?: string;
}

interface I18nState {
  lang: Language;
}

export class I18nService {
  readonly #store: Store<I18nState>;
  readonly #dictionaries: Readonly<Record<Language, Dictionary>>;
  readonly #storage: SafeStorage | null;
  readonly #storageKey: string;

  constructor({ dictionaries, initial, storage = null, storageKey = "lang" }: I18nOptions) {
    this.#dictionaries = dictionaries;
    this.#storage = storage;
    this.#storageKey = storageKey;
    this.#store = new Store<I18nState>({
      lang: isSupportedLanguage(initial) ? initial : DEFAULT_LANGUAGE,
    });
  }

  get lang(): Language {
    return this.#store.get("lang");
  }

  get locale(): string {
    return languageInfo(this.lang).locale;
  }

  get languages(): readonly LanguageInfo[] {
    return LANGUAGES;
  }

  t(key: string, vars?: MessageVars): string {
    const message: Message =
      this.#lookup(this.lang, key) ?? this.#lookup(DEFAULT_LANGUAGE, key) ?? key;
    const text =
      typeof message === "string"
        ? message
        : selectPlural(message, Number(vars?.count ?? 0), this.locale);
    return interpolate(text, vars);
  }

  has(key: string): boolean {
    return (
      this.#lookup(this.lang, key) !== undefined ||
      this.#lookup(DEFAULT_LANGUAGE, key) !== undefined
    );
  }

  pick(value: LocalizedText | string): string {
    return localize(value, this.lang);
  }

  number(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  set(lang: string): void {
    if (!isSupportedLanguage(lang)) return;
    this.#store.set("lang", lang);
    this.#storage?.write(this.#storageKey, lang);
  }

  subscribe(
    listener: (lang: Language, previous: Language | undefined) => void,
    options?: { immediate?: boolean },
  ): () => void {
    return this.#store.subscribe("lang", listener, options);
  }

  #lookup(lang: Language, key: string): Message | undefined {
    return this.#dictionaries[lang][key];
  }
}

export function resolveInitialLanguage(
  sources: {
    search?: string;
    stored?: string | null;
    preferred?: readonly string[];
  } = {},
): Language {
  const { search = "", stored = null, preferred = [] } = sources;
  const fromUrl = new URLSearchParams(search).get("lang");
  if (isSupportedLanguage(fromUrl)) return fromUrl;
  if (isSupportedLanguage(stored)) return stored;
  for (const tag of preferred) {
    const primary = String(tag).toLowerCase().split("-")[0];
    if (isSupportedLanguage(primary)) return primary;
  }
  return DEFAULT_LANGUAGE;
}
