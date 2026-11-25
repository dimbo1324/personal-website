import { Component } from "../../core/component";
import { motion } from "../../core/motion";
import { BRAND_NAMES } from "../../data/brand";
import type { ScrambleText } from "../text/ScrambleText";
import { ScrambleText as Decoder } from "../text/ScrambleText";
import { EmblemFlipper } from "./EmblemFlipper";
import { SplitFlap } from "./SplitFlap";

interface BrandMarkParts {
  readonly name: HTMLElement;
  readonly hint: HTMLElement;
  readonly letters: readonly HTMLElement[];
  readonly emblem?: { readonly intervalMs: number; readonly holdMs: number };
}

/**
 * Header brand: two-sided emblem (DP ⇄ helmet avatar) + name.
 * hover → front: letters flip (CSS) · back: helmet tips (CSS) · name decodes
 * click → the card turns over, a ripple leaves it, the name flips EN → RU → ES;
 *         landing on the DP side scrambles the letters like a split-flap board
 * idle  → the card periodically turns over to show the avatar (EmblemFlipper)
 */
export class BrandMark extends Component<HTMLAnchorElement> {
  static readonly RIPPLE_MS = 850;
  static readonly HOVER_COOLDOWN_MS = 1400;

  readonly #flaps: SplitFlap[];
  readonly #flipper: EmblemFlipper;
  readonly #nameScramble: ScrambleText;
  readonly #hintScramble: ScrambleText;
  #variant = 0;
  #rippleTimer = 0;
  #lastHover = 0;

  constructor(root: HTMLAnchorElement, { name, hint, letters, emblem }: BrandMarkParts) {
    super(root);
    this.#nameScramble = new Decoder(name, { speed: 20 });
    this.#hintScramble = new Decoder(hint, { speed: 24 });
    this.#flaps = letters.map((letter, index) => new SplitFlap(letter, { steps: 7 + index * 4 }));
    this.#flipper = new EmblemFlipper(root, {
      ...(emblem ? { ...emblem } : {}),
      onChange: (flipped) => {
        if (!flipped) for (const flap of this.#flaps) void flap.spin();
      },
    });
  }

  override mount(): this {
    this.on(this.root, "pointerenter", () => this.#onHover());
    this.on(this.root, "pointerleave", () => this.#flipper.resume());
    this.on(this.root, "click", () => this.#onPress());
    this.#flipper.startAuto();
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearTimeout(this.#rippleTimer);
    this.#flipper.stop();
    this.#nameScramble.cancel();
    this.#hintScramble.cancel();
    for (const flap of this.#flaps) flap.cancel();
  }

  get #current(): { readonly name: string; readonly hint: string } | undefined {
    return BRAND_NAMES[this.#variant];
  }

  #onHover(): void {
    this.#flipper.pause();
    const now = performance.now();
    if (now - this.#lastHover < BrandMark.HOVER_COOLDOWN_MS) return;
    this.#lastHover = now;
    const current = this.#current;
    if (current) void this.#nameScramble.play(current.name);
  }

  #onPress(): void {
    this.#variant = (this.#variant + 1) % BRAND_NAMES.length;
    const current = this.#current;
    if (current) {
      void this.#nameScramble.play(current.name);
      void this.#hintScramble.play(current.hint);
    }
    this.#flipper.toggle();

    if (motion.reduced) return;
    this.root.classList.remove("is-rebooting");
    void this.root.offsetWidth;
    this.root.classList.add("is-rebooting");
    window.clearTimeout(this.#rippleTimer);
    this.#rippleTimer = window.setTimeout(() => {
      this.root.classList.remove("is-rebooting");
    }, BrandMark.RIPPLE_MS);
  }
}
