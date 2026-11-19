/**
 * Keeps an unfinished request in sessionStorage so a reload doesn't wipe it.
 * sessionStorage (not localStorage) on purpose: personal data disappears
 * when the tab is closed. The consent checkbox is never persisted.
 */
export class DraftStore {
  static FIELDS = Object.freeze(["lastName", "firstName", "middleName", "phone", "email", "message"]);

  #key;

  /** @param {string} key */
  constructor(key) {
    this.#key = key;
  }

  load() {
    try {
      const raw = window.sessionStorage.getItem(this.#key);
      const data = raw ? JSON.parse(raw) : null;
      return data && typeof data === "object" ? data : null;
    } catch {
      return null;
    }
  }

  save(values) {
    const draft = {};
    DraftStore.FIELDS.forEach((name) => {
      if (typeof values[name] === "string" && values[name] !== "") draft[name] = values[name];
    });
    try {
      if (Object.keys(draft).length) window.sessionStorage.setItem(this.#key, JSON.stringify(draft));
      else window.sessionStorage.removeItem(this.#key);
    } catch {
      /* storage unavailable */
    }
  }

  clear() {
    try {
      window.sessionStorage.removeItem(this.#key);
    } catch {
      /* storage unavailable */
    }
  }
}
