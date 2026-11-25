import { createElement } from "../../core/dom.js";

/** Rolling, newest-first event list for the SCADA window. */
export class EventLog {
  static MAX_ENTRIES = 14;

  #list;

  /** @param {HTMLOListElement} list */
  constructor(list) {
    this.#list = list;
  }

  get isEmpty() {
    return this.#list.children.length === 0;
  }

  push(message) {
    const time = new Date().toTimeString().slice(0, 8);
    this.#list.prepend(createElement("li", { text: `[${time}] ${message}` }));
    while (this.#list.children.length > EventLog.MAX_ENTRIES) this.#list.lastElementChild.remove();
  }
}
