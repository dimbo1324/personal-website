import { Component } from "../../core/component";
import type { ScrollService } from "./ScrollService";

interface ScrollTopOptions {
  readonly ring: SVGCircleElement | null;
  readonly scroll: ScrollService;
  readonly onNavigate?: () => void;
}

/** Floating "back to top" button with a circular progress ring. */
export class ScrollTopButton extends Component<HTMLButtonElement> {
  static readonly SHOW_AFTER = 320;
  static readonly RADIUS = 24;

  readonly #ring: SVGCircleElement | null;
  readonly #scroll: ScrollService;
  readonly #onNavigate: (() => void) | undefined;
  readonly #circumference = 2 * Math.PI * ScrollTopButton.RADIUS;

  constructor(root: HTMLButtonElement, { ring, scroll, onNavigate }: ScrollTopOptions) {
    super(root);
    this.#ring = ring;
    this.#scroll = scroll;
    this.#onNavigate = onNavigate;
  }

  override mount(): this {
    if (this.#ring) {
      this.#ring.style.strokeDasharray = `${this.#circumference} ${this.#circumference}`;
    }
    this.own(this.#scroll.subscribe(({ y, progress }) => this.#render(y, progress)));
    this.on(this.root, "click", () => {
      this.#onNavigate?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return super.mount();
  }

  #render(y: number, progress: number): void {
    this.root.classList.toggle("is-visible", y > ScrollTopButton.SHOW_AFTER);
    if (this.#ring) {
      this.#ring.style.strokeDashoffset = String(this.#circumference * (1 - progress));
    }
  }
}
