import { Component } from "../../core/Component.js";

/** Live clock for a given IANA time zone; ticks only while on screen. */
export class LocalClock extends Component {
  #format;
  #timer = 0;

  /**
   * @param {HTMLTimeElement} root
   * @param {{ timeZone: string, viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { timeZone, viewport }) {
    super(root);
    this.viewport = viewport;
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

  mount() {
    this.#tick();
    this.own(
      this.viewport.watch(this.root, (entry) => {
        clearInterval(this.#timer);
        if (entry.isIntersecting) this.#timer = window.setInterval(() => this.#tick(), 1000);
      }),
    );
    return super.mount();
  }

  onDestroy() {
    clearInterval(this.#timer);
  }

  #tick() {
    const now = new Date();
    this.root.textContent = this.#format ? this.#format.format(now) : now.toTimeString().slice(0, 8);
    this.root.setAttribute("datetime", now.toISOString());
  }
}
