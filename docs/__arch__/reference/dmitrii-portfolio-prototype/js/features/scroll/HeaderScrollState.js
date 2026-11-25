import { Component } from "../../core/Component.js";

/** Adds a glass background to the header once the page is scrolled. */
export class HeaderScrollState extends Component {
  static THRESHOLD = 24;

  /** @param {HTMLElement} root @param {import("./ScrollService.js").ScrollService} scroll */
  constructor(root, scroll) {
    super(root);
    this.scroll = scroll;
  }

  mount() {
    this.own(this.scroll.subscribe(({ y }) => this.root.classList.toggle("is-scrolled", y > HeaderScrollState.THRESHOLD)));
    return super.mount();
  }
}
