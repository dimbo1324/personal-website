import { Component } from "../../core/Component.js";

/** Floating "back to top" button with a circular progress ring. */
export class ScrollTopButton extends Component {
  static SHOW_AFTER = 320;
  static RADIUS = 24;

  #ring;
  #circumference = 2 * Math.PI * ScrollTopButton.RADIUS;

  /**
   * @param {HTMLButtonElement} root
   * @param {{ ring: SVGCircleElement, scroll: import("./ScrollService.js").ScrollService, onNavigate?: () => void }} options
   */
  constructor(root, { ring, scroll, onNavigate }) {
    super(root);
    this.#ring = ring;
    this.scroll = scroll;
    this.onNavigate = onNavigate;
  }

  mount() {
    if (this.#ring) {
      this.#ring.style.strokeDasharray = `${this.#circumference} ${this.#circumference}`;
    }
    this.own(this.scroll.subscribe(({ y, progress }) => this.#render(y, progress)));
    this.on(this.root, "click", () => {
      this.onNavigate?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return super.mount();
  }

  #render(y, progress) {
    this.root.classList.toggle("is-visible", y > ScrollTopButton.SHOW_AFTER);
    if (this.#ring) this.#ring.style.strokeDashoffset = String(this.#circumference * (1 - progress));
  }
}
