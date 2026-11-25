/** Keeps an unfinished request in sessionStorage; consent is never persisted. */
export class DraftStore {
  static readonly FIELDS: readonly string[] = Object.freeze([
    "lastName",
    "firstName",
    "middleName",
    "phone",
    "email",
    "message",
  ]);

  readonly #key: string;

  constructor(key: string) {
    this.#key = key;
  }

  load(): Record<string, unknown> | null {
    try {
      const raw = window.sessionStorage.getItem(this.#key);
      const data: unknown = raw ? JSON.parse(raw) : null;
      return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  save(values: Readonly<Record<string, unknown>>): void {
    const draft: Record<string, string> = {};
    for (const name of DraftStore.FIELDS) {
      const value = values[name];
      if (typeof value === "string" && value !== "") draft[name] = value;
    }
    try {
      if (Object.keys(draft).length)
        window.sessionStorage.setItem(this.#key, JSON.stringify(draft));
      else window.sessionStorage.removeItem(this.#key);
    } catch {
      // Storage unavailable.
    }
  }

  clear(): void {
    try {
      window.sessionStorage.removeItem(this.#key);
    } catch {
      // Storage unavailable.
    }
  }
}
