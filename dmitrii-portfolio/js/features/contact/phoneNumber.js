/**
 * Builds the phone number from its stored pieces (see data/contact.js).
 * @typedef {{ country: string, groups: readonly string[] }} PhoneParts
 */

/** "+598 96 671 725" @param {PhoneParts} phone */
export const formatPhone = ({ country, groups }) => `+${country} ${groups.join(" ")}`;

/** "+59896671725" — E.164 @param {PhoneParts} phone */
export const e164 = ({ country, groups }) => `+${country}${groups.join("")}`;

/** tel: link @param {PhoneParts} phone */
export const telHref = (phone) => `tel:${e164(phone)}`;

/** WhatsApp click-to-chat link (digits only, no "+") @param {PhoneParts} phone */
export const whatsAppHref = (phone) => `https://wa.me/${e164(phone).slice(1)}`;
