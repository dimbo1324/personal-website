export interface WhatsAppLinkInput {
  readonly phone: string;
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
