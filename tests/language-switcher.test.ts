// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "../src/scripts/site/features/i18n/LanguageSwitcher";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody } from "./helpers/dom";

let i18n: I18nService;
let root: HTMLElement;

beforeEach(() => {
  i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
  setBody(`
    <div data-js="lang-switch">
      <button data-lang="en" aria-pressed="true">EN</button>
      <button data-lang="es" aria-pressed="false">ES</button>
      <button data-lang="ru" aria-pressed="false">RU</button>
    </div>
  `);
  const element = document.querySelector<HTMLElement>("[data-js=lang-switch]");
  if (!element) throw new Error("missing fixture");
  root = element;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("LanguageSwitcher", () => {
  it("selects a language on click and notifies the caller", () => {
    const onChange = vi.fn();
    const switcher = new LanguageSwitcher(root, { i18n, onChange }).mount();
    const buttons = root.querySelectorAll<HTMLButtonElement>("[data-lang]");

    buttons[1]?.click();
    expect(i18n.lang).toBe("es");
    expect(onChange).toHaveBeenCalledWith("es");
    expect(buttons[0]?.getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1]?.getAttribute("aria-pressed")).toBe("true");
    expect(root.style.getPropertyValue("--lang-index")).toBe("1");

    buttons[1]?.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    switcher.destroy();
  });

  it("moves between options with the arrow keys", () => {
    new LanguageSwitcher(root, { i18n }).mount();
    const buttons = root.querySelectorAll<HTMLButtonElement>("[data-lang]");
    const activeElement = document.activeElement;

    buttons[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(i18n.lang).toBe("es");
    expect(document.activeElement).toBe(buttons[1]);
    expect(activeElement).not.toBe(document.activeElement);

    buttons[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(i18n.lang).toBe("en");
    buttons[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(i18n.lang).toBe("ru");
  });

  it("follows external language changes", () => {
    new LanguageSwitcher(root, { i18n }).mount();
    i18n.set("ru");
    const buttons = root.querySelectorAll<HTMLButtonElement>("[data-lang]");
    expect(buttons[2]?.classList.contains("is-active")).toBe(true);
    expect(root.style.getPropertyValue("--lang-index")).toBe("2");
  });
});
