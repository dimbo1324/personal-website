/**
 * localStorage wrapper that never throws
 * (Safari private mode, sandboxed iframes and disabled storage all degrade to no-op).
 */
export class SafeStorage {
  #namespace;

  /** @param {string} namespace */
  constructor(namespace) {
    this.#namespace = namespace;
  }

  #key(key) {
    return `${this.#namespace}.${key}`;
  }

  read(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(this.#key(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  write(key, value) {
    try {
      window.localStorage.setItem(this.#key(key), String(value));
      return true;
    } catch {
      return false;
    }
  }
}
