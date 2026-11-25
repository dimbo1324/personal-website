import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import type { ScrollService } from "../scroll/ScrollService";

interface ScrollSpyOptions {
  readonly aliases?: Readonly<Record<string, string>>;
}

/**
 * Decides which section is "active" from the scroll position and writes it
 * to the store. A short lock after a nav click prevents flicker while the
 * smooth scroll is still travelling. `aliases` maps sections without their
 * own nav item to the item that represents them (request → contact).
 */
export class ScrollSpy {
  static readonly LOCK_MS = 800;

  readonly #sections: readonly HTMLElement[];
  readonly #store: Store<AppState>;
  readonly #scroll: ScrollService;
  readonly #aliases: Readonly<Record<string, string>>;
  #lockedUntil = 0;

  constructor(
    sections: readonly HTMLElement[],
    store: Store<AppState>,
    scroll: ScrollService,
    { aliases = {} }: ScrollSpyOptions = {},
  ) {
    this.#sections = sections;
    this.#store = store;
    this.#scroll = scroll;
    this.#aliases = aliases;
  }

  start(): () => void {
    return this.#scroll.subscribe(() => {
      if (performance.now() < this.#lockedUntil) return;
      this.#store.set("activeSection", this.#resolve(this.#compute()));
    });
  }

  /** Called by nav links: jump the highlight immediately. */
  navigateTo(id: string | undefined): void {
    this.#lockedUntil = performance.now() + ScrollSpy.LOCK_MS;
    this.#store.set("activeSection", this.#resolve(id));
  }

  #resolve(id: string | undefined): string {
    if (!id) return "overview";
    return this.#aliases[id] ?? id;
  }

  #compute(): string {
    const { y, viewportHeight } = this.#scroll.state;
    const first = this.#sections[0]?.id ?? "overview";
    if (y < 60) return first;
    if (viewportHeight + y >= document.documentElement.scrollHeight - 16) {
      return this.#sections.at(-1)?.id ?? first;
    }
    const trigger = Math.max(120, viewportHeight * 0.32);
    let current = first;
    for (const section of this.#sections) {
      if (section.getBoundingClientRect().top <= trigger) current = section.id;
    }
    return current;
  }
}
