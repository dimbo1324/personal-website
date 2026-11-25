export interface WhatsAppLinkInput {
  readonly phone: string;
  readonly message?: string;
}

export type WhatsAppMode = "auto" | "real" | "stub" | "off";

export type WhatsAppPlaceholderReason = "stub" | "unconfigured";

export type WhatsAppChannelState =
  | { readonly kind: "link"; readonly href: string }
  | { readonly kind: "placeholder"; readonly reason: WhatsAppPlaceholderReason };

export interface WhatsAppChannelInput {
  readonly phone: string | null;
  readonly mode: string;
  readonly message?: string;
}

const MIN_E164_DIGITS = 8;
const MAX_E164_DIGITS = 15;
const MAX_MESSAGE_LENGTH = 500;

export class WhatsAppLinkBuilder {
  build(input: WhatsAppLinkInput): string | null {
    const digits = input.phone.replace(/\D/g, "");

    if (digits.length < MIN_E164_DIGITS || digits.length > MAX_E164_DIGITS) {
      return null;
    }

    const baseUrl = `https://wa.me/${digits}`;
    const trimmed = input.message?.trim() ?? "";

    if (trimmed.length === 0) {
      return baseUrl;
    }

    const bounded = trimmed.slice(0, MAX_MESSAGE_LENGTH);

    return `${baseUrl}?text=${encodeURIComponent(bounded)}`;
  }
}

/** Unknown or empty values fall back to "auto": a valid number is enough for a link. */
export function resolveWhatsAppMode(value: string | null | undefined): WhatsAppMode {
  switch (value?.trim().toLowerCase()) {
    case "real":
      return "real";
    case "stub":
      return "stub";
    case "off":
      return "off";
    default:
      return "auto";
  }
}

/**
 * Resolves the WhatsApp channel without pretending a link exists.
 * "stub" is an explicit demo placeholder; "off" and an invalid number are
 * reported as unconfigured. No state is stored and no network call is made.
 */
export class WhatsAppChannel {
  readonly #links: WhatsAppLinkBuilder;

  constructor(links: WhatsAppLinkBuilder = new WhatsAppLinkBuilder()) {
    this.#links = links;
  }

  resolve(input: WhatsAppChannelInput): WhatsAppChannelState {
    const mode = resolveWhatsAppMode(input.mode);

    if (mode === "off") {
      return { kind: "placeholder", reason: "unconfigured" };
    }

    if (mode === "stub") {
      return { kind: "placeholder", reason: "stub" };
    }

    const phone = input.phone?.trim() ?? "";
    const href = phone
      ? this.#links.build({
          phone,
          ...(input.message === undefined ? {} : { message: input.message }),
        })
      : null;

    if (href) {
      return { kind: "link", href };
    }

    return { kind: "placeholder", reason: "unconfigured" };
  }
}
