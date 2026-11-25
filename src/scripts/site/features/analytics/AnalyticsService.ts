import { whenPageIdle } from "../../core/idle";
import { reportWarning } from "../../core/log";
import type { AnalyticsProps } from "./providers/AnalyticsProvider";
import type { AnalyticsProvider } from "./providers/AnalyticsProvider";

export class AnalyticsService {
  readonly #provider: AnalyticsProvider;

  constructor(provider: AnalyticsProvider) {
    this.#provider = provider;
  }

  start({ root = document }: { readonly root?: Document } = {}): () => void {
    whenPageIdle({ timeout: 3000 })
      .then(() => this.#provider.load())
      .catch((error: unknown) => reportWarning("analytics", error));

    const controller = new AbortController();
    root.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const tracked = target.closest("[data-track]");
        if (tracked)
          this.track(tracked.getAttribute("data-track"), { lang: document.documentElement.lang });
      },
      { signal: controller.signal, capture: true },
    );

    return () => controller.abort();
  }

  track(event: string | null, props?: AnalyticsProps): void {
    if (event) this.#provider.track(event, props);
  }
}
