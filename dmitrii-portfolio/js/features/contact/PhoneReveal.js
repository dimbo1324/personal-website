import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";
import { createIcon } from "../../core/icons.js";
import { formatPhone, telHref, whatsAppHref } from "./phoneNumber.js";

/**
 * "Show number" → replaces the button with a call link and a WhatsApp link.
 * The number is assembled from data only on demand, so it is not in the
 * HTML that scrapers read.
 */
export class PhoneReveal extends Component {
  #slot;
  #button;
  #phone;
  #i18n;
  #onReveal;
  #whatsApp = null;
  #call = null;

  /**
   * @param {HTMLElement} root  the channel row
   * @param {{ slot: HTMLElement, button: HTMLButtonElement, phone: import("./phoneNumber.js").PhoneParts,
   *           i18n: import("../../i18n/I18nService.js").I18nService, onReveal?: () => void }} options
   */
  constructor(root, { slot, button, phone, i18n, onReveal = () => {} }) {
    super(root);
    this.#slot = slot;
    this.#button = button;
    this.#phone = phone;
    this.#i18n = i18n;
    this.#onReveal = onReveal;
  }

  mount() {
    this.on(this.#button, "click", () => this.#reveal());
    this.own(this.#i18n.subscribe(() => this.#renderLabels(), { immediate: false }));
    return super.mount();
  }

  #reveal() {
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

  #renderLabels() {
    this.#call?.setAttribute("aria-label", this.#i18n.t("contact.call", { number: this.#call.textContent }));
    this.#whatsApp?.setAttribute("aria-label", this.#i18n.t("contact.whatsapp"));
  }
}
