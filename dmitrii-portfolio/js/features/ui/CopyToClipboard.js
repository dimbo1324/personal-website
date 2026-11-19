/**
 * Copies `data-copy` values. Uses the async Clipboard API and falls back to
 * a hidden textarea + execCommand for older / insecure contexts.
 */
export class CopyToClipboard {
  #toast;

  /** @param {import("./Toast.js").Toast} toast */
  constructor(toast) {
    this.#toast = toast;
  }

  /** @param {HTMLElement[]} buttons @param {AbortSignal} [signal] */
  bind(buttons, signal) {
    buttons.forEach((button) => {
      button.addEventListener("click", () => this.copy(button.dataset.copy), { signal });
    });
  }

  async copy(value) {
    if (!value) return;
    const ok = (await this.#writeAsync(value)) || this.#writeLegacy(value);
    this.#toast.show(ok ? `Copied: ${value}` : "Copy failed — select the text manually", ok ? "check" : "x");
  }

  async #writeAsync(value) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  #writeLegacy(value) {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  }
}
