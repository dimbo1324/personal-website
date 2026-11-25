class MotionPreference {
  readonly #query: MediaQueryList | null =
    window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;

  get reduced(): boolean {
    return this.#query?.matches ?? false;
  }

  onChange(listener: (reduced: boolean) => void): () => void {
    if (!this.#query) return () => undefined;
    const handler = (event: MediaQueryListEvent): void => listener(event.matches);
    this.#query.addEventListener("change", handler);
    return () => this.#query?.removeEventListener("change", handler);
  }
}

export const motion = new MotionPreference();
