import { Component } from "../../core/Component.js";

/** Thin gradient bar at the very top showing page progress. */
export class ScrollProgress extends Component {
  /** @param {HTMLElement} root @param {import("./ScrollService.js").ScrollService} scroll */
  constructor(root, scroll) {
    super(root);
    this.scroll = scroll;
  }

  mount() {
    this.own(this.scroll.subscribe(({ progress }) => {
      this.root.style.transform = `scaleX(${progress.toFixed(4)})`;
    }));
    return super.mount();
  }
}
