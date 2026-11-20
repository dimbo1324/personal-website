/**
 * Immutable, normalised representation of a submitted request,
 * with renderers for the transports (plain text for mail, JSON for HTTP).
 * The text goes to the site owner, so its labels stay in English;
 * the visitor's language is included so the reply can match it.
 */
export class RequestPayload {
  /**
   * @param {Record<string, unknown>} values  raw form values
   * @param {{ lang?: string, now?: Date }} [meta]
   */
  constructor(values, { lang = "en", now = new Date() } = {}) {
    const clean = (value) =>
      String(value ?? "")
        .trim()
        .replace(/\s+/g, " ");
    this.lastName = clean(values.lastName);
    this.firstName = clean(values.firstName);
    this.middleName = clean(values.middleName);
    this.phone = clean(values.phone);
    this.email = clean(values.email).toLowerCase();
    this.message = String(values.message ?? "").trim();
    this.lang = lang;
    this.createdAt = now;
    Object.freeze(this);
  }

  get fullName() {
    return [this.lastName, this.firstName, this.middleName].filter(Boolean).join(" ");
  }

  subject(prefix) {
    return `${prefix} — ${this.fullName}`;
  }

  toPlainText() {
    const contacts = [this.phone && `Phone: ${this.phone}`, this.email && `Email: ${this.email}`].filter(Boolean);
    return [
      `Name: ${this.fullName}`,
      ...contacts,
      `Language: ${this.lang.toUpperCase()}`,
      "",
      "Message:",
      this.message || "—",
      "",
      `Sent from the portfolio site · ${this.createdAt.toISOString()}`,
    ].join("\n");
  }

  toJSON() {
    return {
      lastName: this.lastName,
      firstName: this.firstName,
      middleName: this.middleName || null,
      phone: this.phone || null,
      email: this.email || null,
      message: this.message || null,
      lang: this.lang,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
