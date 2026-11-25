import { Component } from "../../core/component";
import type { RequestConfig } from "../../data/request";
import type { I18nService } from "../../i18n/service";
import type { MessageVars } from "../../i18n/types";
import type { CopyToClipboard } from "../../services/clipboard";
import { CharacterCounter } from "./CharacterCounter";
import { DraftStore } from "./DraftStore";
import { FieldController } from "./FieldController";
import { FormValidator } from "./FormValidator";
import { createGateway } from "./gateways/createGateway";
import type { RequestGateway } from "./gateways/RequestGateway";
import { RequestPayload } from "./RequestPayload";
import { createRequestSchema } from "./RequestSchema";
import type { ValidationIssue } from "./validationIssue";
import type { FieldValue } from "./validators";

interface RequestUi {
  readonly status: HTMLElement;
  readonly hint: HTMLElement | null;
  readonly submit: HTMLButtonElement;
  readonly success: HTMLElement;
  readonly successText: HTMLElement;
  readonly copyButton: HTMLButtonElement;
  readonly resetButton: HTMLButtonElement;
  readonly counter: HTMLElement | null;
}

interface RequestFormOptions {
  readonly config: RequestConfig;
  readonly i18n: I18nService;
  readonly ui: RequestUi;
  readonly clipboard: CopyToClipboard;
  readonly onSent?: (transport: string) => void;
}

interface FormStatus {
  readonly key: string;
  readonly vars?: MessageVars;
}

/** The "Leave a request" form: validation, draft, honeypot and delivery. */
export class RequestForm extends Component<HTMLFormElement> {
  static readonly DRAFT_DEBOUNCE_MS = 400;
  static readonly LINKED_FIELDS: readonly string[] = Object.freeze(["phone", "email"]);

  readonly #validator: FormValidator;
  readonly #gateway: RequestGateway;
  readonly #drafts: DraftStore;
  readonly #i18n: I18nService;
  readonly #fields = new Map<string, FieldController>();
  readonly #ui: RequestUi;
  readonly #copy: CopyToClipboard;
  readonly #onSent: (transport: string) => void;
  #counter: CharacterCounter | null = null;
  #lastPayload: RequestPayload | null = null;
  #status: FormStatus | null = null;
  #success: FormStatus | null = null;
  #draftTimer = 0;
  #submitting = false;

  constructor(
    root: HTMLFormElement,
    { config, i18n, ui, clipboard, onSent = (): void => undefined }: RequestFormOptions,
  ) {
    super(root);
    this.#validator = new FormValidator(createRequestSchema(config));
    this.#gateway = createGateway(config);
    this.#drafts = new DraftStore(config.draftKey);
    this.#i18n = i18n;
    this.#ui = ui;
    this.#copy = clipboard;
    this.#onSent = onSent;

    const translate = (problem: ValidationIssue): string => this.#i18n.t(problem.key, problem.vars);
    for (const wrapper of Array.from(root.querySelectorAll<HTMLElement>("[data-field]"))) {
      const field = new FieldController(wrapper, translate);
      if (field.name) this.#fields.set(field.name, field);
    }
    const message = this.#fields.get("message");
    if (message && ui.counter) {
      this.#counter = new CharacterCounter(
        message.control as HTMLTextAreaElement,
        ui.counter,
        config.limits.message,
        (value) => this.#i18n.number(value),
      );
    }
  }

  override mount(): this {
    this.#restoreDraft();

    this.#fields.forEach((field) => {
      this.on(field.control, "blur", (event) => {
        field.touch();
        if (event.relatedTarget === this.#ui.submit) return;
        this.#validate(field.name ?? "");
      });
      this.on(
        field.control,
        field.control instanceof HTMLInputElement && field.control.type === "checkbox"
          ? "change"
          : "input",
        () => {
          this.#onInput(field);
        },
      );
    });

    this.on(this.root, "submit", (event) => {
      event.preventDefault();
      void this.#submit();
    });
    this.on(this.#ui.copyButton, "click", () => {
      if (this.#lastPayload) void this.#copy.copy(this.#lastPayload.toPlainText());
    });
    this.on(this.#ui.resetButton, "click", () => this.#startOver());
    this.own(this.#i18n.subscribe(() => this.#renderTexts()));
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearTimeout(this.#draftTimer);
  }

  #renderTexts(): void {
    const render = (message: FormStatus | null): string =>
      message ? this.#i18n.t(message.key, message.vars) : "";
    if (this.#ui.hint) this.#ui.hint.textContent = this.#i18n.t(`form.hint.${this.#gateway.kind}`);
    this.#ui.status.textContent = render(this.#status);
    this.#ui.successText.textContent = render(this.#success);
    this.#fields.forEach((field) => field.refresh());
    this.#counter?.update();
  }

  #setStatus(message: FormStatus | null): void {
    this.#status = message;
    this.#ui.status.textContent = message ? this.#i18n.t(message.key, message.vars) : "";
  }

  #values(): Record<string, FieldValue> {
    const values: Record<string, FieldValue> = {};
    this.#fields.forEach((field, name) => {
      values[name] = field.value;
    });
    const website = this.root.elements.namedItem("website");
    values.website = website instanceof HTMLInputElement ? website.value : "";
    return values;
  }

  #onInput(field: FieldController): void {
    if (field.name === "message") this.#counter?.update();
    if (field.touched) this.#validate(field.name ?? "");
    if (field.name && RequestForm.LINKED_FIELDS.includes(field.name)) {
      const linked = RequestForm.LINKED_FIELDS.filter((name) => name !== field.name)
        .map((name) => this.#fields.get(name))
        .filter((candidate): candidate is FieldController => candidate?.touched === true);
      for (const other of linked) this.#validate(other.name ?? "");
    }
    this.#setStatus(null);
    this.#scheduleDraft();
  }

  #validate(name: string): boolean {
    const problem = this.#validator.validateField(name, this.#values());
    this.#fields.get(name)?.render(problem);
    return !problem;
  }

  async #submit(): Promise<void> {
    if (this.#submitting) return;
    const values = this.#values();

    // Bots fill every field — pretend success, send nothing.
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
      const firstName = errors.keys().next().value;
      if (firstName) this.#fields.get(firstName)?.focus();
      return;
    }

    this.#setSubmitting(true);
    this.#setStatus({ key: "form.status.sending" });
    const payload = new RequestPayload(values, { lang: this.#i18n.lang });
    const result = await this.#gateway.send(payload);
    this.#setSubmitting(false);

    if (!result.ok) {
      this.#setStatus({ key: result.messageKey, ...(result.vars ? { vars: result.vars } : {}) });
      return;
    }
    this.#setStatus(null);
    this.#lastPayload = payload;
    this.#drafts.clear();
    this.#onSent(this.#gateway.kind);
    this.#showSuccess({ key: result.messageKey, ...(result.vars ? { vars: result.vars } : {}) });
  }

  #setSubmitting(busy: boolean): void {
    this.#submitting = busy;
    this.#ui.submit.disabled = busy;
    this.#ui.submit.setAttribute("aria-busy", String(busy));
  }

  #showSuccess(message: FormStatus): void {
    const card = this.root.parentElement;
    if (card) card.style.minHeight = `${card.offsetHeight}px`;
    this.#success = message;
    this.#ui.successText.textContent = this.#i18n.t(message.key, message.vars);
    this.root.hidden = true;
    this.#ui.success.hidden = false;
    this.#ui.copyButton.hidden = !this.#lastPayload;
    this.#ui.success.focus({ preventScroll: true });
  }

  #startOver(): void {
    this.root.reset();
    this.#fields.forEach((field) => field.reset());
    this.#counter?.update();
    this.#setStatus(null);
    this.#success = null;
    this.#lastPayload = null;
    this.#ui.success.hidden = true;
    this.#rootVisible();
    this.#fields.values().next().value?.focus();
  }

  #rootVisible(): void {
    this.root.hidden = false;
    this.root.parentElement?.style.removeProperty("min-height");
  }

  #scheduleDraft(): void {
    window.clearTimeout(this.#draftTimer);
    this.#draftTimer = window.setTimeout(() => {
      this.#drafts.save(this.#values());
    }, RequestForm.DRAFT_DEBOUNCE_MS);
  }

  #restoreDraft(): void {
    const draft = this.#drafts.load();
    if (!draft) return;
    for (const [name, value] of Object.entries(draft)) {
      const field = this.#fields.get(name);
      if (field && typeof value === "string") field.value = value;
    }
  }
}
