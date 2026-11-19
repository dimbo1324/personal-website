/**
 * Immutable, normalised representation of a submitted request,
 * with renderers for the transports (plain text for mail, JSON for HTTP).
 */
export class RequestPayload {
  /** @param {Record<string, unknown>} values raw form values */
  constructor(values) {
    const clean = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
    this.lastName = clean(values.lastName);
    this.firstName = clean(values.firstName);
    this.middleName = clean(values.middleName);
    this.phone = clean(values.phone);
    this.email = clean(values.email).toLowerCase();
    this.message = String(values.message ?? "").trim();
    this.createdAt = new Date();
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
      createdAt: this.createdAt.toISOString(),
    };
  }
}
