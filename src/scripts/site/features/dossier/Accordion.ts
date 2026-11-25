import { Component } from "../../core/component";

/** Single-open accordion (opening one row closes the others). */
export class Accordion extends Component<HTMLElement> {
  #items: HTMLElement[] = [];

  override mount(): this {
    this.#items = Array.from(this.root.querySelectorAll(".timeline__item"));
    for (const item of this.#items) {
      const trigger = item.querySelector<HTMLButtonElement>(".timeline__trigger");
      if (trigger) this.on(trigger, "click", () => this.#toggle(item));
    }
    return super.mount();
  }

  #toggle(target: HTMLElement): void {
    const willOpen = !target.classList.contains("is-open");
    for (const item of this.#items) this.#set(item, item === target && willOpen);
  }

  #set(item: HTMLElement, open: boolean): void {
    item.classList.toggle("is-open", open);
    item.querySelector(".timeline__trigger")?.setAttribute("aria-expanded", String(open));
  }
}
