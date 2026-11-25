export interface RequestPayloadMeta {
  readonly lang?: string;
  readonly now?: Date;
}

export interface RequestJson {
  readonly lastName: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly message: string | null;
  readonly lang: string;
  readonly createdAt: string;
}

/** Immutable, normalised representation of a submitted request. */
export class RequestPayload {
  readonly lastName: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly phone: string;
  readonly email: string;
  readonly message: string;
  readonly lang: string;
  readonly createdAt: Date;

  constructor(
    values: Readonly<Record<string, unknown>>,
    { lang = "en", now = new Date() }: RequestPayloadMeta = {},
  ) {
    const clean = (value: unknown): string =>
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

  get fullName(): string {
    return [this.lastName, this.firstName, this.middleName].filter(Boolean).join(" ");
  }

  subject(prefix: string): string {
    return `${prefix} — ${this.fullName}`;
  }

  toPlainText(): string {
    const contacts = [
      this.phone && `Phone: ${this.phone}`,
      this.email && `Email: ${this.email}`,
    ].filter(Boolean);
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

  toJSON(): RequestJson {
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
