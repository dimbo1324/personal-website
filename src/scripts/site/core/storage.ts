export class SafeStorage {
  readonly #namespace: string;

  constructor(namespace: string) {
    this.#namespace = namespace;
  }

  #key(key: string): string {
    return `${this.#namespace}.${key}`;
  }

  read(key: string, fallback: string | null = null): string | null {
    try {
      return window.localStorage.getItem(this.#key(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  write(key: string, value: string | number | boolean): boolean {
    try {
      window.localStorage.setItem(this.#key(key), String(value));
      return true;
    } catch {
      return false;
    }
  }
}
