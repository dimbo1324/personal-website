/**
 * Copies `data-copy` values. Uses the async Clipboard API and falls back to
 * a hidden textarea + execCommand for older / insecure contexts.
 */
export class CopyToClipboard {
  #toast;
  #i18n;

  /**
   * @param {import("./Toast.js").Toast} toast
   * @param {import("../../i18n/I18nService.js").I18nService} i18n
   */
  constructor(toast, i18n) {
    this.#toast = toast;
    this.#i18n = i18n;
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
    const preview = value.length > 48 ? `${value.slice(0, 45)}…` : value;
    this.#toast.show(
      ok ? this.#i18n.t("toast.copied", { value: preview }) : this.#i18n.t("toast.copyFailed"),
      ok ? "check" : "x",
    );
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
    let ok;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  }
}
