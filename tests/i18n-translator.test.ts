// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DomTranslator } from "../src/scripts/site/i18n/translator";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";

afterEach(() => {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  document.documentElement.removeAttribute("lang");
  document.documentElement.removeAttribute("data-i18n-pending");
});

function meta(name: string): HTMLMetaElement {
  const element = document.createElement("meta");
  element.setAttribute("name", name);
  document.head.append(element);
  return element;
}

describe("DomTranslator", () => {
  it("translates text, attributes and document metadata", () => {
    document.title = "Initial";
    document.documentElement.setAttribute("data-i18n-pending", "");
    document.body.innerHTML = `
      <span data-i18n="ui.skip-to-content">Skip</span>
      <a data-i18n-attr="title:header.open-the-interactive-acs-widget" title="Old"></a>
    `;
    const description = meta("description");
    const ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    document.head.append(ogTitle);
    const ogDescription = document.createElement("meta");
    ogDescription.setAttribute("property", "og:description");
    document.head.append(ogDescription);
    const ogLocale = document.createElement("meta");
    ogLocale.setAttribute("property", "og:locale");
    ogLocale.setAttribute("content", "en_US");
    document.head.append(ogLocale);

    const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
    const translator = new DomTranslator(i18n, {
      meta: { description, ogTitle, ogDescription, ogLocale },
    });
    const unsubscribe = translator.start();

    expect(document.querySelector("[data-i18n]")?.textContent).toBe(en["ui.skip-to-content"]);
    expect(document.querySelector("[data-i18n-attr]")?.getAttribute("title")).toBe(
      en["header.open-the-interactive-acs-widget"],
    );
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe(en["meta.title"]);
    expect(description.content).toBe(en["meta.description"]);
    expect(document.documentElement.hasAttribute("data-i18n-pending")).toBe(false);

    i18n.set("es");
    expect(document.documentElement.lang).toBe("es");
    expect(document.querySelector("[data-i18n]")?.textContent).toBe(es["ui.skip-to-content"]);
    expect(ogLocale.content).toBe("es_UY");
    unsubscribe();
  });
});
