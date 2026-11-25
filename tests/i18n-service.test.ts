import { describe, expect, it, vi } from "vitest";
import { I18nService, resolveInitialLanguage } from "../src/scripts/site/i18n/service";
import { interpolate, localize, selectPlural } from "../src/scripts/site/i18n/types";
import { isSupportedLanguage, languageInfo } from "../src/scripts/site/i18n/languages";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";

const dictionaries = { en, es, ru };
const service = (lang = "en"): I18nService => new I18nService({ dictionaries, initial: lang });

describe("resolveInitialLanguage", () => {
  it("prefers the URL, then storage, then browser languages", () => {
    expect(resolveInitialLanguage({ search: "?lang=ru", stored: "es", preferred: ["en-US"] })).toBe(
      "ru",
    );
    expect(resolveInitialLanguage({ search: "", stored: "es", preferred: ["en-US"] })).toBe("es");
    expect(
      resolveInitialLanguage({ search: "?lang=xx", stored: null, preferred: ["es-UY", "en"] }),
    ).toBe("es");
  });

  it("falls back to English", () => {
    expect(resolveInitialLanguage()).toBe("en");
    expect(resolveInitialLanguage({ search: "?lang=de", stored: "xx", preferred: ["de-DE"] })).toBe(
      "en",
    );
  });

  it("recognises only supported codes and exposes metadata", () => {
    expect(isSupportedLanguage("en")).toBe(true);
    expect(isSupportedLanguage("de")).toBe(false);
    expect(languageInfo("es").locale).toBe("es-UY");
    expect(languageInfo("ru").ogLocale).toBe("ru_RU");
  });
});

describe("i18n helpers", () => {
  it("interpolates known variables and keeps unknown placeholders", () => {
    expect(interpolate("Hello {name}", { name: "Ana" })).toBe("Hello Ana");
    expect(interpolate("Hello {name}")).toBe("Hello {name}");
    expect(interpolate("{a}/{b}", { a: 1 })).toBe("1/{b}");
  });

  it("selects plural forms by locale", () => {
    const forms = {
      one: "{count} кадр",
      few: "{count} кадра",
      many: "{count} кадров",
      other: "{count} frame",
    };
    expect(selectPlural(forms, 1, "ru")).toBe("{count} кадр");
    expect(selectPlural(forms, 3, "ru")).toBe("{count} кадра");
    expect(selectPlural(forms, 11, "ru")).toBe("{count} кадров");
    expect(selectPlural(forms, 2, "en")).toBe("{count} frame");
    expect(selectPlural({}, 1, "en")).toBe("");
  });

  it("localises strings and language maps", () => {
    const value = { en: "English", es: "Español", ru: "Русский" };
    expect(localize(value, "es")).toBe("Español");
    expect(localize(value, "de" as "en")).toBe("English");
    expect(localize("plain", "ru")).toBe("plain");
    expect(localize(null, "en")).toBe("");
  });
});

describe("I18nService", () => {
  it("translates, formats and reports missing keys", () => {
    const i18n = service();
    expect(i18n.t("ui.skip-to-content")).toBe("Skip to content");
    expect(i18n.t("toast.copied", { value: "a@b.com" })).toBe("Copied: a@b.com");
    expect(i18n.t("gallery.count", { count: 1, n: "01" })).toContain("01 frame");
    expect(i18n.t("gallery.count", { count: 5, n: "05" })).toContain("05 frames");
    expect(i18n.t("no.such.key")).toBe("no.such.key");
    expect(i18n.has("ui.skip-to-content")).toBe(true);
    expect(i18n.has("no.such.key")).toBe(false);
    expect(i18n.number(1234.5)).toMatch(/1[,.]234/);
  });

  it("picks localised values in the active language", () => {
    const i18n = service("ru");
    expect(i18n.pick({ en: "EN", es: "ES", ru: "RU" })).toBe("RU");
    expect(i18n.lang).toBe("ru");
    expect(i18n.locale).toBe("ru-RU");
    expect(i18n.languages.length).toBe(3);
  });

  it("notifies subscribers when the language changes", () => {
    const i18n = service();
    const listener = vi.fn();
    const unsubscribe = i18n.subscribe(listener);
    i18n.set("es");
    expect(listener).toHaveBeenCalledWith("es", "en");
    expect(i18n.t("ui.skip-to-content")).toBe(es["ui.skip-to-content"]);
    i18n.set("de");
    expect(i18n.lang).toBe("es");
    unsubscribe();
    i18n.set("ru");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
