import { Component } from "../../core/Component.js";

/** Single-open accordion (opening one row closes the others). */
export class Accordion extends Component {
  #items;

  mount() {
    this.#items = Array.from(this.root.querySelectorAll(".timeline__item"));
    this.#items.forEach((item) => {
      const trigger = item.querySelector(".timeline__trigger");
      this.on(trigger, "click", () => this.#toggle(item));
    });
    return super.mount();
  }

  #toggle(target) {
    const willOpen = !target.classList.contains("is-open");
    this.#items.forEach((item) => this.#set(item, item === target && willOpen));
  }

  #set(item, open) {
    item.classList.toggle("is-open", open);
    item.querySelector(".timeline__trigger")?.setAttribute("aria-expanded", String(open));
  }
}
