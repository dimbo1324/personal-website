import { Component } from "../../core/component";
import type { ScrollService } from "./ScrollService";

/** Thin gradient bar at the very top showing page progress. */
export class ScrollProgress extends Component<HTMLElement> {
  readonly #scroll: ScrollService;

  constructor(root: HTMLElement, scroll: ScrollService) {
    super(root);
    this.#scroll = scroll;
  }

  override mount(): this {
    this.own(
      this.#scroll.subscribe(({ progress }) => {
        this.root.style.transform = `scaleX(${progress.toFixed(4)})`;
      }),
    );
    return super.mount();
  }
}
