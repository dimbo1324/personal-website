import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";
import { lockScroll, unlockScroll } from "../../core/scrollLock.js";

/**
 * Full-screen viewer with thumbnails, keyboard navigation (← → Esc),
 * a B&W toggle and focus restoration on close.
 */
export class Lightbox extends Component {
  #items;
  #el;
  #index = 0;
  #open = false;
  #mono = false;
  #returnFocus = null;
  #thumbs = [];

  /**
   * @param {HTMLElement} root
   * @param {{ items: readonly object[], elements: Record<string, HTMLElement> }} options
   */
  constructor(root, { items, elements }) {
    super(root);
    this.#items = items;
    this.#el = elements;
  }

  mount() {
    this.#buildThumbs();
    const { prev, next, close, mono, image } = this.#el;
    this.on(prev, "click", () => this.show(this.#index - 1));
    this.on(next, "click", () => this.show(this.#index + 1));
    this.on(close, "click", () => this.close());
    this.on(mono, "click", () => this.#toggleMono());
    this.on(image, "load", () => image.classList.remove("is-loading"));
    this.on(this.root, "click", (event) => {
      if (event.target === this.root) this.close();
    });
    this.on(document, "keydown", (event) => this.#onKey(event));
    this.root.inert = true;
    return super.mount();
  }

  open(index = 0) {
    this.#returnFocus = document.activeElement;
    this.show(index);
    this.#open = true;
    this.root.inert = false;
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    lockScroll();
    this.#el.close.focus({ preventScroll: true });
  }

  close() {
    if (!this.#open) return;
    this.#open = false;
    this.root.classList.remove("is-open");
    this.root.setAttribute("aria-hidden", "true");
    this.root.inert = true;
    unlockScroll();
    this.#returnFocus?.focus?.({ preventScroll: true });
  }

  show(index) {
    const count = this.#items.length;
    this.#index = (index + count) % count;
    const item = this.#items[this.#index];
    const { image, title, description, counter } = this.#el;

    if (image.getAttribute("src") !== item.src) {
      image.classList.add("is-loading");
      image.src = item.src;
    }
    image.alt = item.title;
    title.textContent = item.title;
    description.textContent = item.description;
    counter.textContent = `${String(this.#index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    this.#thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("is-active", i === this.#index);
      thumb.setAttribute("aria-current", String(i === this.#index));
    });
  }

  #buildThumbs() {
    this.#items.forEach((item, index) => {
      const thumb = createElement("button", {
        className: "lightbox__thumb",
        attrs: { type: "button", "aria-label": `Show ${item.title}` },
        children: [createElement("img", { attrs: { src: item.src, alt: "", loading: "lazy", decoding: "async" } })],
      });
      this.on(thumb, "click", () => this.show(index));
      this.#el.strip.append(thumb);
      this.#thumbs.push(thumb);
    });
  }

  #toggleMono() {
    this.#mono = !this.#mono;
    this.#el.image.classList.toggle("is-mono", this.#mono);
    this.#el.mono.setAttribute("aria-pressed", String(this.#mono));
    this.#el.mono.classList.toggle("is-on", this.#mono);
  }

  #onKey(event) {
    if (!this.#open) return;
    if (event.key === "Escape") this.close();
    if (event.key === "ArrowLeft") this.show(this.#index - 1);
    if (event.key === "ArrowRight") this.show(this.#index + 1);
  }
}
