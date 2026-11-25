import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import { createIcon } from "../../core/icons";
import type { I18nService } from "../../i18n/service";
import { formatPhone, telHref, whatsAppHref } from "./phoneNumber";
import type { PhoneParts } from "./phoneNumber";

interface PhoneRevealOptions {
  readonly slot: HTMLElement;
  readonly button: HTMLButtonElement;
  readonly phone: PhoneParts;
  readonly i18n: I18nService;
  readonly onReveal?: () => void;
}

/**
 * "Show number" → replaces the button with a call link and a WhatsApp link.
 * The number is assembled from data only on demand, so it is not in the
 * HTML that scrapers read.
 */
export class PhoneReveal extends Component<HTMLElement> {
  readonly #slot: HTMLElement;
  readonly #button: HTMLButtonElement;
  readonly #phone: PhoneParts;
  readonly #i18n: I18nService;
  readonly #onReveal: () => void;
  #whatsApp: HTMLAnchorElement | null = null;
  #call: HTMLAnchorElement | null = null;

  constructor(
    root: HTMLElement,
    { slot, button, phone, i18n, onReveal = (): void => undefined }: PhoneRevealOptions,
  ) {
    super(root);
    this.#slot = slot;
    this.#button = button;
    this.#phone = phone;
    this.#i18n = i18n;
    this.#onReveal = onReveal;
  }

  override mount(): this {
    this.on(this.#button, "click", () => this.#reveal());
    this.own(this.#i18n.subscribe(() => this.#renderLabels(), { immediate: false }));
    return super.mount();
  }

  #reveal(): void {
    this.#call = createElement("a", {
      className: "channel__link",
      text: formatPhone(this.#phone),
      attrs: { href: telHref(this.#phone) },
    });
    this.#whatsApp = createElement("a", {
      className: "channel__chip",
      attrs: { href: whatsAppHref(this.#phone), target: "_blank", rel: "noopener noreferrer" },
      children: [createIcon("message-circle", "sm"), createElement("span", { text: "WhatsApp" })],
    });
    this.#slot.replaceChildren(this.#call, this.#whatsApp);
    this.root.classList.add("is-revealed");
    this.#renderLabels();
    this.#call.focus();
    this.#onReveal();
  }

  #renderLabels(): void {
    this.#call?.setAttribute(
      "aria-label",
      this.#i18n.t("contact.call", { number: this.#call.textContent ?? "" }),
    );
    this.#whatsApp?.setAttribute("aria-label", this.#i18n.t("contact.whatsapp"));
  }
}
