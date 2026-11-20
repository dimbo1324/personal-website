/**
 * Decides which section is "active" from the scroll position and writes it
 * to the store. A short lock after a nav click prevents flicker while the
 * smooth scroll is still travelling. `aliases` maps sections without their
 * own nav item to the item that represents them (request → contact).
 */
export class ScrollSpy {
  static LOCK_MS = 800;

  #sections;
  #store;
  #scroll;
  #aliases;
  #lockedUntil = 0;

  /**
   * @param {HTMLElement[]} sections
   * @param {import("../../core/Store.js").Store} store
   * @param {import("../scroll/ScrollService.js").ScrollService} scroll
   * @param {{ aliases?: Record<string, string> }} [options]
   */
  constructor(sections, store, scroll, { aliases = {} } = {}) {
    this.#sections = sections;
    this.#store = store;
    this.#scroll = scroll;
    this.#aliases = aliases;
  }

  start() {
    return this.#scroll.subscribe(() => {
      if (performance.now() < this.#lockedUntil) return;
      this.#store.set("activeSection", this.#resolve(this.#compute()));
    });
  }

  /** Called by nav links: jump the highlight immediately. */
  navigateTo(id) {
    this.#lockedUntil = performance.now() + ScrollSpy.LOCK_MS;
    this.#store.set("activeSection", this.#resolve(id));
  }

  #resolve(id) {
    return this.#aliases[id] ?? id;
  }

  #compute() {
    const { y, viewportHeight } = this.#scroll.state;
    const first = this.#sections[0]?.id ?? "overview";
    if (y < 60) return first;
    if (viewportHeight + y >= document.documentElement.scrollHeight - 16) {
      return this.#sections[this.#sections.length - 1]?.id ?? first;
    }
    const trigger = Math.max(120, viewportHeight * 0.32);
    let current = first;
    this.#sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= trigger) current = section.id;
    });
    return current;
  }
}
