/** Pointer-driven dragging of a fixed-position window by its title bar. */
export class WindowDrag {
  static MARGIN = 8;

  #window;
  #handle;
  #canDrag;

  /**
   * @param {HTMLElement} windowElement
   * @param {HTMLElement} handle
   * @param {() => boolean} canDrag
   */
  constructor(windowElement, handle, canDrag) {
    this.#window = windowElement;
    this.#handle = handle;
    this.#canDrag = canDrag;
  }

  /** @param {AbortSignal} signal */
  attach(signal) {
    this.#handle.addEventListener("pointerdown", (event) => this.#start(event), { signal });
  }

  #start(event) {
    if (event.button !== 0 || event.target.closest("button") || !this.#canDrag()) return;
    event.preventDefault();

    const rect = this.#window.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const { MARGIN } = WindowDrag;

    this.#window.classList.add("is-dragging");
    this.#handle.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      const left = Math.max(MARGIN, Math.min(window.innerWidth - rect.width - MARGIN, moveEvent.clientX - offsetX));
      const top = Math.max(MARGIN, Math.min(window.innerHeight - 48, moveEvent.clientY - offsetY));
      this.#window.style.left = `${left}px`;
      this.#window.style.top = `${top}px`;
    };
    const end = () => {
      this.#window.classList.remove("is-dragging");
      this.#handle.removeEventListener("pointermove", move);
      this.#handle.removeEventListener("pointerup", end);
      this.#handle.removeEventListener("pointercancel", end);
    };

    this.#handle.addEventListener("pointermove", move);
    this.#handle.addEventListener("pointerup", end);
    this.#handle.addEventListener("pointercancel", end);
  }
}
