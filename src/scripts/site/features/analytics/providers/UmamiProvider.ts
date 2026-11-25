import type { AnalyticsProps } from "./AnalyticsProvider";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { loadScript } from "../loadScript";

interface UmamiApi {
  track(event: string, props?: AnalyticsProps): void;
}

interface UmamiWindow extends Window {
  umami?: UmamiApi;
}

export class UmamiProvider extends AnalyticsProvider {
  static readonly DEFAULT_SRC = "https://cloud.umami.is/script.js";

  readonly #websiteId: string;
  readonly #src: string;
  readonly #queue: Array<{ event: string; props?: AnalyticsProps }> = [];
  #ready = false;

  constructor({ websiteId, src }: { websiteId: string | null; src: string | null }) {
    super();
    if (!websiteId) throw new Error("Umami needs PUBLIC_ANALYTICS_WEBSITE_ID");
    this.#websiteId = websiteId;
    this.#src = src ?? UmamiProvider.DEFAULT_SRC;
  }

  override async load(): Promise<void> {
    await loadScript(this.#src, { websiteId: this.#websiteId, respectDoNotTrack: "true" });
    this.#ready = true;
    for (const entry of this.#queue.splice(0)) this.track(entry.event, entry.props);
  }

  override track(event: string, props?: AnalyticsProps): void {
    if (!this.#ready) {
      this.#queue.push(props ? { event, props } : { event });
      return;
    }
    try {
      (window as UmamiWindow).umami?.track(event, props);
    } catch {
      // Analytics must never break the page.
    }
  }
}
