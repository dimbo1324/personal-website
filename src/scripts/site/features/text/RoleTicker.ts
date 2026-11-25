import { Component } from "../../core/component";
import { motion } from "../../core/motion";
import type { ViewportObserver } from "../../core/viewport";
import type { LocalizedText } from "../../i18n/types";
import type { I18nService } from "../../i18n/service";
import { ScrambleText } from "./ScrambleText";

interface RoleTickerOptions {
  readonly text: HTMLElement;
  readonly phrases: readonly LocalizedText[];
  readonly i18n: I18nService;
  readonly viewport: ViewportObserver;
}

/** Cycles engineering disciplines in the hero eyebrow. */
export class RoleTicker extends Component<HTMLButtonElement> {
  static readonly INTERVAL_MS = 4400;

  readonly #phrases: readonly LocalizedText[];
  readonly #i18n: I18nService;
  readonly #viewport: ViewportObserver;
  readonly #scramble: ScrambleText;
  #index = 0;
  #timer = 0;
  #visible = true;

  constructor(root: HTMLButtonElement, { text, phrases, i18n, viewport }: RoleTickerOptions) {
    super(root);
    this.#phrases = phrases;
    this.#i18n = i18n;
    this.#viewport = viewport;
    this.#scramble = new ScrambleText(text);
  }

  override mount(): this {
    this.own(this.#i18n.subscribe(() => this.#play()));
    this.on(this.root, "click", () => this.#advance());
    this.own(
      this.#viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#schedule();
      }),
    );
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearInterval(this.#timer);
    this.#scramble.cancel();
  }

  #schedule(): void {
    window.clearInterval(this.#timer);
    if (!this.#visible || motion.reduced) return;
    this.#timer = window.setInterval(() => this.#advance(), RoleTicker.INTERVAL_MS);
  }

  #advance(): void {
    this.#index = (this.#index + 1) % this.#phrases.length;
    this.#play();
  }

  #play(): void {
    const phrase = this.#phrases[this.#index] ?? this.#phrases[0];
    if (phrase) void this.#scramble.play(this.#i18n.pick(phrase));
  }
}
