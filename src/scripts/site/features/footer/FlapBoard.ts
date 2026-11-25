import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import type { ViewportObserver } from "../../core/viewport";
import { SplitFlap } from "../brand/SplitFlap";

/** Split-flap departure/arrivals board. */
export class FlapBoard extends Component<HTMLElement> {
  static readonly STAGGER_STEPS = 2;
  static readonly BASE_STEPS = 8;
  static readonly HOVER_COOLDOWN_MS = 2500;

  readonly #viewport: ViewportObserver;
  readonly #flaps: SplitFlap[] = [];
  #seen = false;
  #lastSpin = 0;

  constructor(root: HTMLElement, { viewport }: { readonly viewport: ViewportObserver }) {
    super(root);
    this.#viewport = viewport;
  }

  override mount(): this {
    const text = (this.root.dataset.text ?? "").toUpperCase();
    for (const [index, char] of Array.from(text).entries()) {
      const glyph = createElement("span", {
        className: "flap-tile__char",
        text: char === " " ? " " : char,
      });
      this.root.append(createElement("span", { className: "flap-tile", children: [glyph] }));
      this.#flaps.push(
        new SplitFlap(glyph, { steps: FlapBoard.BASE_STEPS + index * FlapBoard.STAGGER_STEPS }),
      );
    }

    this.own(
      this.#viewport.watch(this.root, (entry) => {
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

  protected override onDestroy(): void {
    for (const flap of this.#flaps) flap.cancel();
  }

  spin(): void {
    this.#lastSpin = performance.now();
    for (const flap of this.#flaps) void flap.spin();
  }
}
