export interface PhoneParts {
  readonly country: string;
  readonly groups: readonly string[];
}

/** "+598 96 671 725" */
export const formatPhone = ({ country, groups }: PhoneParts): string =>
  `+${country} ${groups.join(" ")}`;

/** "+59896671725" — E.164 */
export const e164 = ({ country, groups }: PhoneParts): string => `+${country}${groups.join("")}`;

export const telHref = (phone: PhoneParts): string => `tel:${e164(phone)}`;

/** WhatsApp click-to-chat link (digits only, no "+"). */
export const whatsAppHref = (phone: PhoneParts): string => `https://wa.me/${e164(phone).slice(1)}`;
