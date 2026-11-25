import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import { createIcon } from "../../core/icons";
import type { I18nService } from "../../i18n/service";
import type { WhatsAppChannel, WhatsAppChannelState } from "../../../../lib/whatsapp";
import { formatPhone, telHref } from "./phoneNumber";
import type { PhoneParts } from "./phoneNumber";

interface WhatsAppOptions {
  readonly channel: WhatsAppChannel;
  readonly phone: string | null;
  readonly mode: string;
  readonly greetingKey: string;
}

interface PhoneRevealOptions {
  readonly slot: HTMLElement;
  readonly button: HTMLButtonElement;
  readonly phone: PhoneParts;
  readonly whatsApp: WhatsAppOptions;
  readonly i18n: I18nService;
  readonly onReveal?: () => void;
}

interface WhatsAppElement {
  readonly element: HTMLAnchorElement | HTMLSpanElement;
  readonly label: HTMLSpanElement;
}

/**
 * "Show number" → replaces the button with a call link and a WhatsApp entry.
 * The number is assembled from data only on demand, so it is not in the
 * HTML that scrapers read. WhatsApp is a real link only when the channel
 * resolves one; otherwise the block shows an honest placeholder.
 */
export class PhoneReveal extends Component<HTMLElement> {
  readonly #slot: HTMLElement;
  readonly #button: HTMLButtonElement;
  readonly #phone: PhoneParts;
  readonly #whatsApp: WhatsAppOptions;
  readonly #i18n: I18nService;
  readonly #onReveal: () => void;
  #whatsAppElement: HTMLAnchorElement | HTMLSpanElement | null = null;
  #whatsAppLabel: HTMLSpanElement | null = null;
  #call: HTMLAnchorElement | null = null;

  constructor(
    root: HTMLElement,
    { slot, button, phone, whatsApp, i18n, onReveal = (): void => undefined }: PhoneRevealOptions,
  ) {
    super(root);
    this.#slot = slot;
    this.#button = button;
    this.#phone = phone;
    this.#whatsApp = whatsApp;
    this.#i18n = i18n;
    this.#onReveal = onReveal;
  }

  override mount(): this {
    this.on(this.#button, "click", () => this.#reveal());
    this.own(this.#i18n.subscribe(() => this.#renderLabels(), { immediate: false }));
    return super.mount();
  }

  #reveal(): void {
    const whatsApp = this.#createWhatsApp(this.#whatsAppState());
    this.#call = createElement("a", {
      className: "channel__link",
      text: formatPhone(this.#phone),
      attrs: { href: telHref(this.#phone) },
    });
    this.#whatsAppElement = whatsApp.element;
    this.#whatsAppLabel = whatsApp.label;
    this.#slot.replaceChildren(this.#call, whatsApp.element);
    this.root.classList.add("is-revealed");
    this.#renderLabels();
    this.#call.focus();
    this.#onReveal();
  }

  #createWhatsApp(state: WhatsAppChannelState): WhatsAppElement {
    const label = createElement("span");

    if (state.kind === "link") {
      const element = createElement("a", {
        className: "channel__chip",
        attrs: {
          href: state.href,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        children: [createIcon("message-circle", "sm"), label],
      });
      return { element, label };
    }

    const element = createElement("span", {
      className: "channel__chip channel__chip--disabled",
      attrs: { "aria-disabled": "true" },
      children: [createIcon("message-circle", "sm"), label],
    });
    return { element, label };
  }

  #whatsAppState(): WhatsAppChannelState {
    return this.#whatsApp.channel.resolve({
      phone: this.#whatsApp.phone,
      mode: this.#whatsApp.mode,
      message: this.#i18n.t(this.#whatsApp.greetingKey),
    });
  }

  #renderLabels(): void {
    this.#call?.setAttribute(
      "aria-label",
      this.#i18n.t("contact.call", { number: this.#call.textContent ?? "" }),
    );

    if (!this.#whatsAppElement || !this.#whatsAppLabel) {
      return;
    }

    const state = this.#whatsAppState();

    if (state.kind === "link" && this.#whatsAppElement instanceof HTMLAnchorElement) {
      this.#whatsAppElement.setAttribute("href", state.href);
      this.#whatsAppElement.setAttribute("aria-label", this.#i18n.t("contact.whatsapp"));
      this.#whatsAppLabel.textContent = "WhatsApp";
      return;
    }

    const reason = state.kind === "placeholder" ? state.reason : "unconfigured";
    const text = this.#i18n.t(
      reason === "stub" ? "contact.whatsapp.stub" : "contact.whatsapp.unavailable",
    );
    this.#whatsAppElement.setAttribute("aria-label", text);
    this.#whatsAppLabel.textContent = text;
  }
}
