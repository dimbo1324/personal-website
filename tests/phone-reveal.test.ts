// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PhoneReveal } from "../src/scripts/site/features/contact/PhoneReveal";
import { CONTACT } from "../src/scripts/site/data/contact";
import { WhatsAppChannel } from "../src/lib/whatsapp";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });

function mount(whatsApp: { readonly phone?: string | null; readonly mode: string }): HTMLElement {
  setBody(`
    <div class="channel channel--reveal" data-js="phone-reveal">
      <span data-js="phone-slot">
        <button type="button" data-js="phone-reveal-button">Show number</button>
      </span>
    </div>
  `);
  const root = document.querySelector<HTMLElement>('[data-js="phone-reveal"]');
  const slot = document.querySelector<HTMLElement>('[data-js="phone-slot"]');
  const button = document.querySelector<HTMLButtonElement>('[data-js="phone-reveal-button"]');
  if (!root || !slot || !button) throw new Error("missing reveal DOM");

  new PhoneReveal(root, {
    slot,
    button,
    phone: CONTACT.phone,
    whatsApp: {
      channel: new WhatsAppChannel(),
      phone: whatsApp.phone === undefined ? "59896671725" : whatsApp.phone,
      mode: whatsApp.mode,
      greetingKey: "contact.whatsapp.prefill",
    },
    i18n,
  }).mount();
  return slot;
}

function reveal(): void {
  document.querySelector<HTMLButtonElement>('[data-js="phone-reveal-button"]')?.click();
}

beforeEach(() => i18n.set("en"));
afterEach(() => document.body.replaceChildren());

describe("PhoneReveal", () => {
  it("reveals a tel link and a real wa.me link with a localized greeting", () => {
    const slot = mount({ mode: "real" });
    expect(slot.querySelector("button")).not.toBeNull();

    reveal();

    const call = slot.querySelector<HTMLAnchorElement>("a.channel__link");
    const whatsApp = slot.querySelector<HTMLAnchorElement>("a.channel__chip");
    expect(call?.getAttribute("href")).toBe("tel:+59896671725");
    expect(whatsApp?.getAttribute("target")).toBe("_blank");
    expect(whatsApp?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(whatsApp?.getAttribute("href")).toContain("https://wa.me/59896671725?text=");
    expect(whatsApp?.getAttribute("aria-label")).toBe("Write on WhatsApp");

    i18n.set("ru");
    expect(decodeURIComponent(String(whatsApp?.getAttribute("href")))).toContain(
      "Здравствуйте, Дмитрий!",
    );
  });

  it("renders an honest disabled placeholder in stub mode and follows the language", () => {
    const slot = mount({ mode: "stub" });
    reveal();

    const placeholder = slot.querySelector<HTMLElement>(".channel__chip--disabled");
    expect(placeholder?.tagName).toBe("SPAN");
    expect(slot.querySelector("a.channel__chip")).toBeNull();
    expect(placeholder?.getAttribute("aria-disabled")).toBe("true");
    expect(placeholder?.textContent).toContain("WhatsApp — demo mode");

    i18n.set("ru");
    expect(placeholder?.textContent).toContain("WhatsApp — демо-режим");
    expect(placeholder?.getAttribute("aria-label")).toContain("демо-режим");
  });

  it("does not pretend a link exists when the number is invalid", () => {
    const slot = mount({ mode: "real", phone: "12345" });
    reveal();

    expect(slot.querySelector("a.channel__chip")).toBeNull();
    expect(slot.querySelector(".channel__chip--disabled")?.textContent).toContain(
      "not connected yet",
    );
    expect(slot.querySelector("a.channel__link")?.getAttribute("href")).toBe("tel:+59896671725");
  });
});
