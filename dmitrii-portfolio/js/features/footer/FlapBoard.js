import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";
import { SplitFlap } from "../brand/SplitFlap.js";

/**
 * Split-flap departure/arrivals board.
 * Builds one tile per character of data-text, then — the first time it is
 * seen and again on hover (with a cooldown) — every tile ticks through
 * random glyphs and lands, left to right, on its letter.
 */
export class FlapBoard extends Component {
  static STAGGER_STEPS = 2;
  static BASE_STEPS = 8;
  static HOVER_COOLDOWN_MS = 2500;

  #flaps = [];
  #seen = false;
  #lastSpin = 0;

  /** @param {HTMLElement} root @param {{ viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options */
  constructor(root, { viewport }) {
    super(root);
    this.viewport = viewport;
  }

  mount() {
    const text = (this.root.dataset.text ?? "").toUpperCase();
    [...text].forEach((char, index) => {
      const glyph = createElement("span", { className: "flap-tile__char", text: char === " " ? " " : char });
      this.root.append(createElement("span", { className: "flap-tile", children: [glyph] }));
      this.#flaps.push(new SplitFlap(glyph, { steps: FlapBoard.BASE_STEPS + index * FlapBoard.STAGGER_STEPS }));
    });

    this.own(
      this.viewport.watch(this.root, (entry) => {
        if (entry.isIntersecting && !this.#seen) {
          this.#seen = true;
          this.spin();
        }
      }),
    );
    this.on(this.root, "pointerenter", () => {
      if (performance.now() - this.#lastSpin > FlapBoard.HOVER_COOLDOWN_MS) this.spin();
    });
    return super.mount();
  }

  onDestroy() {
    this.#flaps.forEach((flap) => flap.cancel());
  }

  spin() {
    this.#lastSpin = performance.now();
    this.#flaps.forEach((flap) => flap.spin());
  }
}
