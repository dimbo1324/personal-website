import { LeadValidator } from "../lib/lead";

export class LeadFormController {
  readonly #form: HTMLFormElement;
  readonly #status: HTMLElement | null;
  readonly #validator: LeadValidator;

  constructor(form: HTMLFormElement, validator: LeadValidator = new LeadValidator()) {
    this.#form = form;
    this.#status = form.querySelector<HTMLElement>("[data-lead-status]");
    this.#validator = validator;
  }

  mount(): void {
    this.#form.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.#submit();
    });
  }

  async #submit(): Promise<void> {
    const formData = new FormData(this.#form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
      turnstileToken: String(formData.get("cf-turnstile-response") ?? ""),
    };

    const validation = this.#validator.validate(payload);

    if (!validation.ok) {
      this.#setStatus(`Please check the form (${validation.code}).`);
      return;
    }

    this.#setStatus("Sending...");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        this.#setStatus("Request rejected. Please try again or use WhatsApp.");
        return;
      }

      this.#form.reset();
      this.#setStatus("Request received.");
    } catch {
      this.#setStatus("Network error. Please try again or use WhatsApp.");
    }
  }

  #setStatus(text: string): void {
    if (this.#status) {
      this.#status.textContent = text;
    }
  }
}
