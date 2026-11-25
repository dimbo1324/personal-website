import { Component } from "../../core/component";
import type { I18nService } from "../../i18n/service";
import { DwellTrigger } from "./DwellTrigger";

interface TheaterLauncherOptions {
  readonly label: HTMLElement | null;
  readonly onLaunch: (from: DOMRect) => void;
  readonly i18n: I18nService;
}

/** Turns the hero media frame into the theater entrance. */
export class TheaterLauncher extends Component<HTMLElement> {
  static readonly DWELL_MS = 5000;

  readonly #dwell: DwellTrigger;
  readonly #label: HTMLElement | null;
  readonly #onLaunch: (from: DOMRect) => void;
  readonly #i18n: I18nService;

  constructor(root: HTMLElement, { label, onLaunch, i18n }: TheaterLauncherOptions) {
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

  override mount(): this {
    this.#dwell.attach();
    this.on(this.root, "click", (event) => {
      event.preventDefault();
      this.#dwell.cancel();
      this.#launch();
    });
    this.on(this.root, "keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      this.#launch();
    });
    return super.mount();
  }

  protected override onDestroy(): void {
    this.#dwell.destroy();
  }

  /** Rect of the video screen (the element that "becomes" the theater stage). */
  get screenRect(): DOMRect {
    return (
      this.root.querySelector(".media-frame__screen")?.getBoundingClientRect() ??
      this.root.getBoundingClientRect()
    );
  }

  #render(progress: number): void {
    this.root.classList.toggle("is-dwelling", progress > 0);
    this.root.style.setProperty("--dwell-angle", `${(progress * 360).toFixed(1)}deg`);
    if (progress > 0 && this.#label) {
      const seconds = Math.max(1, Math.ceil((1 - progress) * (TheaterLauncher.DWELL_MS / 1000)));
      const text = this.#i18n.t("reel.dwell", { seconds });
      if (this.#label.textContent !== text) this.#label.textContent = text;
    }
  }

  #launch(): void {
    this.#render(0);
    this.#onLaunch(this.screenRect);
  }
}
