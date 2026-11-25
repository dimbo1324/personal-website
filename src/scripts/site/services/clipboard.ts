import type { I18nService } from "../i18n/service";
import type { Toast } from "./toast";

export class CopyToClipboard {
  readonly #toast: Toast;
  readonly #i18n: I18nService;

  constructor(toast: Toast, i18n: I18nService) {
    this.#toast = toast;
    this.#i18n = i18n;
  }

  bind(buttons: readonly HTMLElement[], signal?: AbortSignal): void {
    for (const button of buttons) {
      button.addEventListener(
        "click",
        () => {
          void this.copy(button.dataset.copy);
        },
        signal ? { signal } : undefined,
      );
    }
  }

  async copy(value: string | undefined): Promise<void> {
    if (!value) return;
    const ok = (await this.#writeAsync(value)) || this.#writeLegacy(value);
    const preview = value.length > 48 ? `${value.slice(0, 45)}…` : value;
    this.#toast.show(
      ok ? this.#i18n.t("toast.copied", { value: preview }) : this.#i18n.t("toast.copyFailed"),
      ok ? "check" : "x",
    );
  }

  async #writeAsync(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  #writeLegacy(value: string): boolean {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    let ok: boolean;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  }
}
