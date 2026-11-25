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
  #i18n;

  /**
   * @param {HTMLElement} root
   * @param {{ items: readonly any[], elements: Record<string, any>,
   *           i18n: import("../../i18n/I18nService.js").I18nService }} options
   */
  constructor(root, { items, elements, i18n }) {
    super(root);
    this.#items = items;
    this.#el = elements;
    this.#i18n = i18n;
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
    this.own(this.#i18n.subscribe(() => this.#renderTexts(), { immediate: false }));
    this.#renderTexts();
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
    const { image, counter } = this.#el;

    if (image.getAttribute("src") !== item.image.src) {
      image.classList.add("is-loading");
      // the viewer is full-screen: the largest file, no srcset guessing
      image.removeAttribute("srcset");
      image.src = item.image.src;
    }
    this.#renderCaption();
    counter.textContent = `${String(this.#index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    this.#thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("is-active", i === this.#index);
      thumb.setAttribute("aria-current", String(i === this.#index));
    });
  }

  #renderCaption() {
    const item = this.#items[this.#index];
    const name = this.#i18n.pick(item.title);
    this.#el.image.alt = name;
    this.#el.title.textContent = name;
    this.#el.description.textContent = this.#i18n.pick(item.description);
  }

  #renderTexts() {
    this.#renderCaption();
    this.#thumbs.forEach((thumb, index) => {
      thumb.setAttribute("aria-label", this.#i18n.t("gallery.show", { title: this.#i18n.pick(this.#items[index].title) }));
    });
  }

  #buildThumbs() {
    this.#items.forEach((item, index) => {
      const thumb = createElement("button", {
        className: "lightbox__thumb",
        attrs: { type: "button" },
        children: [
          createElement("img", {
            attrs: { src: item.image.src, srcset: item.image.srcset, sizes: "96px", alt: "", loading: "lazy", decoding: "async" },
          }),
        ],
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
