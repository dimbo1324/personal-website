import { Component } from "../../core/component";
import type { ScrollService } from "./ScrollService";

/** Adds a glass background to the header once the page is scrolled. */
export class HeaderScrollState extends Component<HTMLElement> {
  static readonly THRESHOLD = 24;

  readonly #scroll: ScrollService;

  constructor(root: HTMLElement, scroll: ScrollService) {
    super(root);
    this.#scroll = scroll;
  }

  override mount(): this {
    this.own(
      this.#scroll.subscribe(({ y }) => {
        this.root.classList.toggle("is-scrolled", y > HeaderScrollState.THRESHOLD);
      }),
    );
    return super.mount();
  }
}
