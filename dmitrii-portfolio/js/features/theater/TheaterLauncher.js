import { Component } from "../../core/Component.js";
import { DwellTrigger } from "./DwellTrigger.js";

/**
 * Turns the hero media frame into the theater entrance:
 * hover → progress ring + countdown (5 s) → open; click → open now.
 */
export class TheaterLauncher extends Component {
  static DWELL_MS = 5000;

  #dwell;
  #label;
  #onLaunch;
  #i18n;

  /**
   * @param {HTMLElement} root  the media frame
   * @param {{ label: HTMLElement, onLaunch: (from: DOMRect) => void,
   *           i18n: import("../../i18n/I18nService.js").I18nService }} options
   */
  constructor(root, { label, onLaunch, i18n }) {
    super(root);
    this.#i18n = i18n;
    this.#label = label;
    this.#onLaunch = onLaunch;
    this.#dwell = new DwellTrigger(root, {
      duration: TheaterLauncher.DWELL_MS,
      onProgress: (progress) => this.#render(progress),
      onComplete: () => this.#launch(),
    });
  }

  mount() {
    this.#dwell.attach();
    this.on(this.root, "click", (event) => {
      event.preventDefault();
      this.#dwell.cancel();
      this.#launch();
    });
    // the frame is a role="button" container — give it button keyboard semantics
    this.on(this.root, "keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.#launch();
    });
    return super.mount();
  }

  onDestroy() {
    this.#dwell.destroy();
  }

  /** Rect of the video screen (the element that "becomes" the theater stage). */
  get screenRect() {
    return this.root.querySelector(".media-frame__screen")?.getBoundingClientRect() ?? this.root.getBoundingClientRect();
  }

  #render(progress) {
    this.root.classList.toggle("is-dwelling", progress > 0);
    this.root.style.setProperty("--dwell-angle", `${(progress * 360).toFixed(1)}deg`);
    if (progress > 0 && this.#label) {
      const seconds = Math.max(1, Math.ceil((1 - progress) * (TheaterLauncher.DWELL_MS / 1000)));
      const text = this.#i18n.t("reel.dwell", { seconds });
      if (this.#label.textContent !== text) this.#label.textContent = text;
    }
  }

  #launch() {
    this.#render(0);
    this.#onLaunch(this.screenRect);
  }
}
