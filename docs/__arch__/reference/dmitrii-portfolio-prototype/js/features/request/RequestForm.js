import { Component } from "../../core/Component.js";
import { FormValidator } from "./FormValidator.js";
import { FieldController } from "./FieldController.js";
import { CharacterCounter } from "./CharacterCounter.js";
import { RequestPayload } from "./RequestPayload.js";
import { DraftStore } from "./DraftStore.js";
import { createRequestSchema } from "./RequestSchema.js";
import { createGateway } from "./gateways/createGateway.js";

/**
 * "Leave a request" form.
 * - validates on blur (after first touch) and on submit, focusing the first error;
 * - "phone OR email" cross-rule re-validates both fields together;
 * - keeps a session draft, ignores bots via a honeypot;
 * - delivers through a pluggable gateway (Web3Forms / Formspree / mailto);
 * - every message is a translation key, so a language switch re-renders it;
 * - swaps to a success panel with "copy request" / "new request".
 */
export class RequestForm extends Component {
  static DRAFT_DEBOUNCE_MS = 400;
  static LINKED_FIELDS = Object.freeze(["phone", "email"]);

  #validator;
  #gateway;
  #drafts;
  #i18n;
  #fields = new Map();
  #counter;
  #ui;
  #copy;
  #onSent;
  #lastPayload = null;
  /** @type {{ key: string, vars?: Record<string, unknown> } | null} */
  #status = null;
  /** @type {{ key: string, vars?: Record<string, unknown> } | null} */
  #success = null;
  #draftTimer = 0;
  #submitting = false;

  /**
   * @param {HTMLFormElement} root
   * @param {{ config: typeof import("../../data/request.js").REQUEST_CONFIG,
   *           i18n: import("../../i18n/I18nService.js").I18nService,
   *           ui: { status: HTMLElement, hint?: HTMLElement | null, submit: HTMLButtonElement, success: HTMLElement,
   *                 successText: HTMLElement, copyButton: HTMLButtonElement, resetButton: HTMLButtonElement,
   *                 counter: HTMLElement },
   *           clipboard: import("../ui/CopyToClipboard.js").CopyToClipboard,
   *           onSent?: (transport: string) => void }} options
   */
  constructor(root, { config, i18n, ui, clipboard, onSent = () => {} }) {
    super(root);
    this.#validator = new FormValidator(createRequestSchema(config));
    this.#gateway = createGateway(config);
    this.#drafts = new DraftStore(config.draftKey);
    this.#i18n = i18n;
    this.#ui = ui;
    this.#copy = clipboard;
    this.#onSent = onSent;

    const translate = (problem) => i18n.t(problem.key, problem.vars);
    root.querySelectorAll("[data-field]").forEach((/** @type {HTMLElement} */ wrapper) => {
      const field = new FieldController(wrapper, translate);
      this.#fields.set(field.name, field);
    });
    const message = this.#fields.get("message");
    if (message && ui.counter) {
      this.#counter = new CharacterCounter(message.control, ui.counter, config.limits.message, (n) => i18n.number(n));
    }
  }

  mount() {
    this.#restoreDraft();

    this.#fields.forEach((field) => {
      this.on(field.control, "blur", (event) => {
        field.touch();
        // leaving the field to press "Send" — the submit handler validates everything
        if (event.relatedTarget === this.#ui.submit) return;
        this.#validate(field.name);
      });
      this.on(field.control, field.control.type === "checkbox" ? "change" : "input", () => this.#onInput(field));
    });

    this.on(this.root, "submit", (event) => {
      event.preventDefault();
      this.#submit();
    });
    this.on(this.#ui.copyButton, "click", () => this.#lastPayload && this.#copy.copy(this.#lastPayload.toPlainText()));
    this.on(this.#ui.resetButton, "click", () => this.#startOver());
    this.own(this.#i18n.subscribe(() => this.#renderTexts()));
    return super.mount();
  }

  onDestroy() {
    clearTimeout(this.#draftTimer);
  }

  /** Everything this form writes itself, in the current language. */
  #renderTexts() {
    const t = (message) => (message ? this.#i18n.t(message.key, message.vars) : "");
    if (this.#ui.hint) this.#ui.hint.textContent = this.#i18n.t(`form.hint.${this.#gateway.kind}`);
    this.#ui.status.textContent = t(this.#status);
    this.#ui.successText.textContent = t(this.#success);
    this.#fields.forEach((field) => field.refresh());
    this.#counter?.update();
  }

  #setStatus(message) {
    this.#status = message;
    this.#ui.status.textContent = message ? this.#i18n.t(message.key, message.vars) : "";
  }

  /** Current values of all fields (+ honeypot). */
  #values() {
    /** @type {Record<string, any>} */
    const values = {};
    this.#fields.forEach((field, name) => {
      values[name] = field.value;
    });
    values.website = this.root.elements.namedItem("website")?.value ?? "";
    return values;
  }

  #onInput(field) {
    if (field.name === "message") this.#counter?.update();
    // re-validate live only once the user has left the field (no nagging while typing)
    if (field.touched) this.#validate(field.name);
    if (RequestForm.LINKED_FIELDS.includes(field.name)) {
      RequestForm.LINKED_FIELDS.filter((name) => name !== field.name)
        .map((name) => this.#fields.get(name))
        .filter((linked) => linked?.touched)
        .forEach((linked) => this.#validate(linked.name));
    }
    this.#setStatus(null);
    this.#scheduleDraft();
  }

  #validate(name) {
    const problem = this.#validator.validateField(name, this.#values());
    this.#fields.get(name)?.render(problem);
    return !problem;
  }

  async #submit() {
    if (this.#submitting) return;
    const values = this.#values();

    // bots fill every field — pretend success, send nothing
    if (values.website) {
      this.#showSuccess({ key: "form.result.thanks" });
      return;
    }

    const errors = this.#validator.validateAll(values);
    this.#fields.forEach((field, name) => {
      field.touch();
      field.render(errors.get(name) ?? null);
    });

    if (errors.size > 0) {
      this.#setStatus({ key: "form.status.invalid", vars: { count: errors.size } });
      this.#fields.get(errors.keys().next().value)?.focus();
      return;
    }

    this.#setSubmitting(true);
    this.#setStatus({ key: "form.status.sending" });
    const payload = new RequestPayload(values, { lang: this.#i18n.lang });
    const result = await this.#gateway.send(payload);
    this.#setSubmitting(false);

    if (!result.ok) {
      this.#setStatus({ key: result.messageKey, vars: result.vars });
      return;
    }
    this.#setStatus(null);
    this.#lastPayload = payload;
    this.#drafts.clear();
    this.#onSent(this.#gateway.kind);
    this.#showSuccess({ key: result.messageKey, vars: result.vars });
  }

  #setSubmitting(busy) {
    this.#submitting = busy;
    this.#ui.submit.disabled = busy;
    this.#ui.submit.setAttribute("aria-busy", String(busy));
  }

  #showSuccess(message) {
    // lock the card height so swapping form → success causes no layout jump
    const card = this.root.parentElement;
    if (card) card.style.minHeight = `${card.offsetHeight}px`;
    this.#success = message;
    this.#ui.successText.textContent = this.#i18n.t(message.key, message.vars);
    this.root.hidden = true;
    this.#ui.success.hidden = false;
    this.#ui.copyButton.hidden = !this.#lastPayload;
    this.#ui.success.focus({ preventScroll: true });
  }

  #startOver() {
    this.root.reset();
    this.#fields.forEach((field) => field.reset());
    this.#counter?.update();
    this.#setStatus(null);
    this.#success = null;
    this.#lastPayload = null;
    this.#ui.success.hidden = true;
    this.root.hidden = false;
    this.root.parentElement?.style.removeProperty("min-height");
    this.#fields.values().next().value?.focus();
  }

  #scheduleDraft() {
    clearTimeout(this.#draftTimer);
    this.#draftTimer = window.setTimeout(() => this.#drafts.save(this.#values()), RequestForm.DRAFT_DEBOUNCE_MS);
  }

  #restoreDraft() {
    const draft = this.#drafts.load();
    if (!draft) return;
    Object.entries(draft).forEach(([name, value]) => {
      const field = this.#fields.get(name);
      if (field && typeof value === "string") field.value = value;
    });
  }
}
