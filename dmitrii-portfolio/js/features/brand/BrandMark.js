import { Component } from "../../core/Component.js";
import { ScrambleText } from "../text/ScrambleText.js";
import { SplitFlap } from "./SplitFlap.js";
import { EmblemFlipper } from "./EmblemFlipper.js";
import { motion } from "../../core/MotionPreference.js";
import { BRAND_NAMES } from "../../data/brand.js";

/**
 * Header brand: two-sided emblem (DP ⇄ helmet avatar) + name.
 * hover → front: letters flip (CSS) · back: helmet tips (CSS) · name decodes
 * click → the card turns over, a ripple leaves it, the name flips EN → RU → ES;
 *         landing on the DP side scrambles the letters like a split-flap board
 * idle  → the card periodically turns over to show the avatar (EmblemFlipper)
 */
export class BrandMark extends Component {
  static RIPPLE_MS = 850;
  static HOVER_COOLDOWN_MS = 1400;

  #variant = 0;
  #flaps;
  #flipper;
  #nameScramble;
  #hintScramble;
  #rippleTimer = 0;
  #lastHover = 0;

  /**
   * @param {HTMLAnchorElement} root
   * @param {{ name: HTMLElement, hint: HTMLElement, letters: HTMLElement[],
   *           emblem?: { intervalMs: number, holdMs: number } }} parts
   */
  constructor(root, { name, hint, letters, emblem }) {
    super(root);
    this.#nameScramble = new ScrambleText(name, { speed: 20 });
    this.#hintScramble = new ScrambleText(hint, { speed: 24 });
    this.#flaps = letters.map((letter, index) => new SplitFlap(letter, { steps: 7 + index * 4 }));
    this.#flipper = new EmblemFlipper(root, {
      ...emblem,
      onChange: (flipped) => {
        if (!flipped) this.#flaps.forEach((flap) => flap.spin());
      },
    });
  }

  mount() {
    this.on(this.root, "pointerenter", () => this.#onHover());
    this.on(this.root, "pointerleave", () => this.#flipper.resume());
    this.on(this.root, "click", () => this.#onPress());
    this.#flipper.startAuto();
    return super.mount();
  }

  onDestroy() {
    clearTimeout(this.#rippleTimer);
    this.#flipper.stop();
    this.#nameScramble.cancel();
    this.#hintScramble.cancel();
    this.#flaps.forEach((flap) => flap.cancel());
  }

  get #current() {
    return BRAND_NAMES[this.#variant];
  }

  #onHover() {
    this.#flipper.pause(); // don't turn the card away from under the cursor
    const now = performance.now();
    if (now - this.#lastHover < BrandMark.HOVER_COOLDOWN_MS) return;
    this.#lastHover = now;
    this.#nameScramble.play(this.#current.name);
  }

  #onPress() {
    this.#variant = (this.#variant + 1) % BRAND_NAMES.length;
    this.#nameScramble.play(this.#current.name);
    this.#hintScramble.play(this.#current.hint);
    this.#flipper.toggle();

    if (motion.reduced) return;
    this.root.classList.remove("is-rebooting");
    void this.root.offsetWidth;
    this.root.classList.add("is-rebooting");
    clearTimeout(this.#rippleTimer);
    this.#rippleTimer = window.setTimeout(() => this.root.classList.remove("is-rebooting"), BrandMark.RIPPLE_MS);
  }
}
