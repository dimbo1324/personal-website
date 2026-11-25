import { describe, expect, it } from "vitest";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";

const dictionaries = { en, es, ru };

describe("locale dictionaries", () => {
  it("share the same keys", () => {
    const expected = Object.keys(en).sort();
    expect(Object.keys(es).sort()).toEqual(expected);
    expect(Object.keys(ru).sort()).toEqual(expected);
  });

  it("have no empty messages", () => {
    for (const [language, dictionary] of Object.entries(dictionaries)) {
      for (const [key, message] of Object.entries(dictionary)) {
        const label = `${language}:${key}`;
        if (typeof message === "string") {
          expect(message.trim(), label).not.toBe("");
        } else {
          expect(Object.keys(message).length, label).toBeGreaterThan(0);
        }
      }
    }
  });
});
