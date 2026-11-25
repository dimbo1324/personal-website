/** Pointer-driven resizing from the bottom-right grip. */
export class WindowResize {
  static readonly MIN_W = 340;
  static readonly MIN_H = 380;
  static readonly MARGIN = 8;

  readonly #window: HTMLElement;
  readonly #grip: HTMLElement;
  readonly #canResize: () => boolean;

  constructor(windowElement: HTMLElement, grip: HTMLElement, canResize: () => boolean) {
    this.#window = windowElement;
    this.#grip = grip;
    this.#canResize = canResize;
  }

  attach(signal: AbortSignal): void {
    this.#grip.addEventListener("pointerdown", (event) => this.#start(event), { signal });
  }

  #start(event: PointerEvent): void {
    if (event.button !== 0 || !this.#canResize()) return;
    event.preventDefault();

    const rect = this.#window.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const { MIN_W, MIN_H, MARGIN } = WindowResize;

    this.#window.classList.add("is-resizing");
    this.#grip.setPointerCapture(event.pointerId);

    const move = (moveEvent: PointerEvent): void => {
      const width = Math.max(
        MIN_W,
        Math.min(window.innerWidth - rect.left - MARGIN, rect.width + moveEvent.clientX - startX),
      );
      const height = Math.max(
        MIN_H,
        Math.min(window.innerHeight - rect.top - MARGIN, rect.height + moveEvent.clientY - startY),
      );
      this.#window.style.width = `${width}px`;
      this.#window.style.height = `${height}px`;
    };
    const end = (): void => {
      this.#window.classList.remove("is-resizing");
      this.#grip.removeEventListener("pointermove", move);
      this.#grip.removeEventListener("pointerup", end);
      this.#grip.removeEventListener("pointercancel", end);
    };

    this.#grip.addEventListener("pointermove", move);
    this.#grip.addEventListener("pointerup", end);
    this.#grip.addEventListener("pointercancel", end);
  }
}
