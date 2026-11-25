export interface LeadSubmission {
  readonly name: string;
  readonly contact: string;
  readonly message: string;
  readonly turnstileToken: string;
  readonly website?: string;
}

export type LeadValidationErrorCode =
  | "invalid_payload"
  | "honeypot_triggered"
  | "invalid_name"
  | "invalid_contact"
  | "invalid_message"
  | "missing_turnstile_token";

export type LeadValidationResult =
  | { readonly ok: true; readonly data: LeadSubmission }
  | { readonly ok: false; readonly code: LeadValidationErrorCode };

const NAME_MIN = 2;
const NAME_MAX = 120;
const CONTACT_MIN = 3;
const CONTACT_MAX = 160;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const TOKEN_MAX = 2048;

export class LeadValidator {
  validate(raw: unknown): LeadValidationResult {
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, code: "invalid_payload" };
    }

    const record = raw as Record<string, unknown>;
    const website = this.#readString(record["website"]);

    if (website.length > 0) {
      return { ok: false, code: "honeypot_triggered" };
    }

    const name = this.#readString(record["name"]);

    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      return { ok: false, code: "invalid_name" };
    }

    const contact = this.#readString(record["contact"]);

    if (contact.length < CONTACT_MIN || contact.length > CONTACT_MAX) {
      return { ok: false, code: "invalid_contact" };
    }

    const message = this.#readString(record["message"]);

    if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
      return { ok: false, code: "invalid_message" };
    }

    const turnstileToken = this.#readString(record["turnstileToken"]);

    if (turnstileToken.length === 0 || turnstileToken.length > TOKEN_MAX) {
      return { ok: false, code: "missing_turnstile_token" };
    }

    return {
      ok: true,
      data: {
        name,
        contact,
        message,
        turnstileToken,
      },
    };
  }

  #readString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }
}
