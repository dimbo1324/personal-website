import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import type { GalleryItem } from "../../data/gallery";
import type { I18nService } from "../../i18n/service";

const SIZE_CLASS: Readonly<Record<string, string>> = Object.freeze({
  feature: "bento__item--feature",
  tall: "bento__item--tall",
});

/** Rendered widths of the bento cells, so srcset picks a fitting file. */
const SIZES = Object.freeze({
  feature: "(max-width: 720px) 100vw, (max-width: 1100px) 66vw, 50vw",
  default: "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw",
});

interface GalleryGridOptions {
  readonly items: readonly GalleryItem[];
  readonly onOpen: (index: number) => void;
  readonly counter?: HTMLElement | null;
  readonly i18n: I18nService;
}

interface GalleryCard {
  readonly card: HTMLButtonElement;
  readonly image: HTMLImageElement;
  readonly tag: HTMLElement;
  readonly title: HTMLElement;
}

/** Builds the bento gallery from data (DOM API only, no innerHTML). */
export class GalleryGrid extends Component<HTMLUListElement> {
  readonly #items: readonly GalleryItem[];
  readonly #onOpen: (index: number) => void;
  readonly #counter: HTMLElement | null;
  readonly #i18n: I18nService;
  readonly #cards: GalleryCard[] = [];

  constructor(root: HTMLUListElement, { items, onOpen, counter = null, i18n }: GalleryGridOptions) {
    super(root);
    this.#items = items;
    this.#onOpen = onOpen;
    this.#counter = counter;
    this.#i18n = i18n;
  }

  override mount(): this {
    const fragment = document.createDocumentFragment();
    this.#items.forEach((item, index) => fragment.append(this.#createItem(item, index)));
    this.root.append(fragment);
    this.own(this.#i18n.subscribe(() => this.#renderTexts()));
    return super.mount();
  }

  #renderTexts(): void {
    const count = this.#items.length;
    if (this.#counter) {
      this.#counter.textContent = this.#i18n.t("gallery.count", {
        count,
        n: String(count).padStart(2, "0"),
      });
    }
    this.#cards.forEach(({ card, image, tag, title }, index) => {
      const item = this.#items[index];
      if (!item) return;
      const name = this.#i18n.pick(item.title);
      image.alt = name;
      tag.textContent = this.#i18n.pick(item.tag);
      title.textContent = name;
      card.setAttribute("aria-label", this.#i18n.t("gallery.open", { title: name }));
    });
  }

  #createItem(item: GalleryItem, index: number): HTMLLIElement {
    const image = createElement("img", {
      attrs: {
        src: item.image.src,
        srcset: item.image.srcset,
        sizes: item.size === "feature" ? SIZES.feature : SIZES.default,
        alt: "",
        loading: "lazy",
        decoding: "async",
      },
    });
    if (item.position) image.style.objectPosition = item.position;

    const tag = createElement("span", { className: "bento-card__tag" });
    const title = createElement("span", { className: "bento-card__title" });
    const card = createElement("button", {
      className: "bento-card tile",
      attrs: { type: "button" },
      children: [
        createElement("span", { className: "bento-card__media", children: [image] }),
        createElement("span", {
          className: "bento-card__meta",
          children: [
            createElement("span", { children: [tag, title] }),
            createElement("span", {
              className: "bento-card__index",
              text: String(index + 1).padStart(2, "0"),
            }),
          ],
        }),
      ],
    });
    this.on(card, "click", () => this.#onOpen(index));
    this.on(image, "error", () => card.classList.add("is-fallback"), { once: true });
    this.#cards.push({ card, image, tag, title });

    const sizeClass = item.size ? SIZE_CLASS[item.size] : undefined;
    return createElement("li", {
      className: sizeClass ? `bento__item ${sizeClass}` : "bento__item",
      children: [card],
    });
  }
}
