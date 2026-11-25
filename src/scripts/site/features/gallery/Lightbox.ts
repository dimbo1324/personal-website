import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import { lockScroll, unlockScroll } from "../../core/scroll-lock";
import type { GalleryItem } from "../../data/gallery";
import type { I18nService } from "../../i18n/service";

interface LightboxElements {
  readonly prev: HTMLButtonElement;
  readonly next: HTMLButtonElement;
  readonly close: HTMLButtonElement;
  readonly mono: HTMLButtonElement;
  readonly image: HTMLImageElement;
  readonly counter: HTMLElement;
  readonly title: HTMLElement;
  readonly description: HTMLElement;
  readonly strip: HTMLElement;
}

interface LightboxOptions {
  readonly items: readonly GalleryItem[];
  readonly elements: LightboxElements;
  readonly i18n: I18nService;
}

/** Full-screen viewer with thumbnails, keyboard navigation and a B&W toggle. */
export class Lightbox extends Component<HTMLElement> {
  readonly #items: readonly GalleryItem[];
  readonly #el: LightboxElements;
  readonly #i18n: I18nService;
  readonly #thumbs: HTMLButtonElement[] = [];
  #index = 0;
  #open = false;
  #mono = false;
  #returnFocus: Element | null = null;

  constructor(root: HTMLElement, { items, elements, i18n }: LightboxOptions) {
    super(root);
    this.#items = items;
    this.#el = elements;
    this.#i18n = i18n;
  }

  override mount(): this {
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

  open(index = 0): void {
    this.#returnFocus = document.activeElement;
    this.show(index);
    this.#open = true;
    this.root.inert = false;
    this.root.classList.add("is-open");
    this.root.setAttribute("aria-hidden", "false");
    lockScroll();
    this.#el.close.focus({ preventScroll: true });
  }

  close(): void {
    if (!this.#open) return;
    this.#open = false;
    this.root.classList.remove("is-open");
    this.root.setAttribute("aria-hidden", "true");
    this.root.inert = true;
    unlockScroll();
    if (this.#returnFocus instanceof HTMLElement) this.#returnFocus.focus({ preventScroll: true });
  }

  show(index: number): void {
    const count = this.#items.length;
    if (count === 0) return;
    this.#index = (index + count) % count;
    const item = this.#items[this.#index];
    if (!item) return;
    const { image, counter } = this.#el;

    if (image.getAttribute("src") !== item.image.src) {
      image.classList.add("is-loading");
      image.removeAttribute("srcset");
      image.src = item.image.src;
    }
    this.#renderCaption();
    counter.textContent = `${String(this.#index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    this.#thumbs.forEach((thumb, position) => {
      thumb.classList.toggle("is-active", position === this.#index);
      thumb.setAttribute("aria-current", String(position === this.#index));
    });
  }

  #renderCaption(): void {
    const item = this.#items[this.#index];
    if (!item) return;
    const name = this.#i18n.pick(item.title);
    this.#el.image.alt = name;
    this.#el.title.textContent = name;
    this.#el.description.textContent = this.#i18n.pick(item.description);
  }

  #renderTexts(): void {
    this.#renderCaption();
    this.#thumbs.forEach((thumb, index) => {
      const item = this.#items[index];
      if (!item) return;
      thumb.setAttribute(
        "aria-label",
        this.#i18n.t("gallery.show", { title: this.#i18n.pick(item.title) }),
      );
    });
  }

  #buildThumbs(): void {
    this.#items.forEach((item, index) => {
      const thumb = createElement("button", {
        className: "lightbox__thumb",
        attrs: { type: "button" },
        children: [
          createElement("img", {
            attrs: {
              src: item.image.src,
              srcset: item.image.srcset,
              sizes: "96px",
              alt: "",
              loading: "lazy",
              decoding: "async",
            },
          }),
        ],
      });
      this.on(thumb, "click", () => this.show(index));
      this.#el.strip.append(thumb);
      this.#thumbs.push(thumb);
    });
  }

  #toggleMono(): void {
    this.#mono = !this.#mono;
    this.#el.image.classList.toggle("is-mono", this.#mono);
    this.#el.mono.setAttribute("aria-pressed", String(this.#mono));
    this.#el.mono.classList.toggle("is-on", this.#mono);
  }

  #onKey(event: KeyboardEvent): void {
    if (!this.#open) return;
    if (event.key === "Escape") this.close();
    if (event.key === "ArrowLeft") this.show(this.#index - 1);
    if (event.key === "ArrowRight") this.show(this.#index + 1);
  }
}
