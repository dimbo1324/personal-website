import { createElement } from "../../core/dom";

/** Rolling, newest-first event list for the SCADA window. */
export class EventLog {
  static readonly MAX_ENTRIES = 14;

  readonly #list: HTMLOListElement;

  constructor(list: HTMLOListElement) {
    this.#list = list;
  }

  get isEmpty(): boolean {
    return this.#list.children.length === 0;
  }

  push(message: string): void {
    const time = new Date().toTimeString().slice(0, 8);
    this.#list.prepend(createElement("li", { text: `[${time}] ${message}` }));
    while (this.#list.children.length > EventLog.MAX_ENTRIES) {
      this.#list.lastElementChild?.remove();
    }
  }
}
