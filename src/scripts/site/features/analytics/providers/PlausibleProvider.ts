import type { AnalyticsProps } from "./AnalyticsProvider";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { loadScript } from "../loadScript";

interface PlausibleQueue {
  (...args: unknown[]): void;
  q?: unknown[];
}

interface PlausibleWindow extends Window {
  plausible?: PlausibleQueue;
}

export class PlausibleProvider extends AnalyticsProvider {
  static readonly DEFAULT_SRC = "https://plausible.io/js/script.js";

  readonly #domain: string;
  readonly #src: string;

  constructor({ domain, src }: { domain: string | null; src: string | null }) {
    super();
    if (!domain) throw new Error("Plausible needs PUBLIC_ANALYTICS_DOMAIN");
    this.#domain = domain;
    this.#src = src ?? PlausibleProvider.DEFAULT_SRC;
  }

  override async load(): Promise<void> {
    const analyticsWindow = window as PlausibleWindow;
    analyticsWindow.plausible =
      analyticsWindow.plausible ??
      function plausibleQueue(...args: unknown[]): void {
        const queue = analyticsWindow.plausible;
        if (queue) queue.q = [...(queue.q ?? []), args];
      };
    await loadScript(this.#src, { domain: this.#domain });
  }

  override track(event: string, props?: AnalyticsProps): void {
    try {
      (window as PlausibleWindow).plausible?.(event, props ? { props } : undefined);
    } catch {
      // Analytics must never break the page.
    }
  }
}
