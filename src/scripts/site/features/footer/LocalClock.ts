import { Component } from "../../core/component";
import type { ViewportObserver } from "../../core/viewport";

interface LocalClockOptions {
  readonly timeZone: string;
  readonly viewport: ViewportObserver;
}

/** Live clock for a given IANA time zone; ticks only while on screen. */
export class LocalClock extends Component<HTMLTimeElement> {
  readonly #format: Intl.DateTimeFormat | null;
  readonly #viewport: ViewportObserver;
  #timer = 0;

  constructor(root: HTMLTimeElement, { timeZone, viewport }: LocalClockOptions) {
    super(root);
    this.#viewport = viewport;
    try {
      this.#format = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      this.#format = null;
    }
  }

  override mount(): this {
    this.#tick();
    this.own(
      this.#viewport.watch(this.root, (entry) => {
        window.clearInterval(this.#timer);
        if (entry.isIntersecting) this.#timer = window.setInterval(() => this.#tick(), 1000);
      }),
    );
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearInterval(this.#timer);
  }

  #tick(): void {
    const now = new Date();
    this.root.textContent = this.#format
      ? this.#format.format(now)
      : now.toTimeString().slice(0, 8);
    this.root.setAttribute("datetime", now.toISOString());
  }
}
