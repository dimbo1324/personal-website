import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";

const SIZE_CLASS = Object.freeze({ feature: "bento__item--feature", tall: "bento__item--tall" });
/** Rendered widths of the bento cells, so srcset picks a fitting file. */
const SIZES = Object.freeze({
  feature: "(max-width: 720px) 100vw, (max-width: 1100px) 66vw, 50vw",
  default: "(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw",
});

/**
 * Builds the bento gallery from data (DOM API only, no innerHTML).
 * Every card is a .tile, so it gets the laser hover from tile.css.
 * Texts are { en, es, ru } and re-render on language change.
 */
export class GalleryGrid extends Component {
  #items;
  #onOpen;
  #i18n;
  #counter;
  /** @type {{ card: HTMLElement, image: HTMLImageElement, tag: HTMLElement, title: HTMLElement }[]} */
  #cards = [];

  /**
   * @param {HTMLUListElement} root
   * @param {{ items: readonly object[], onOpen: (index: number) => void, counter?: HTMLElement | null,
   *           i18n: import("../../i18n/I18nService.js").I18nService }} options
   */
  constructor(root, { items, onOpen, counter = null, i18n }) {
    super(root);
    this.#items = items;
    this.#onOpen = onOpen;
    this.#counter = counter;
    this.#i18n = i18n;
  }

  mount() {
    const fragment = document.createDocumentFragment();
    this.#items.forEach((item, index) => fragment.append(this.#createItem(item, index)));
    this.root.append(fragment);
    this.own(this.#i18n.subscribe(() => this.#renderTexts()));
    return super.mount();
  }

  #renderTexts() {
    const { t, pick } = { t: this.#i18n.t.bind(this.#i18n), pick: this.#i18n.pick.bind(this.#i18n) };
    const count = this.#items.length;
    if (this.#counter) this.#counter.textContent = t("gallery.count", { count, n: String(count).padStart(2, "0") });
    this.#cards.forEach(({ card, image, tag, title }, index) => {
      const item = this.#items[index];
      const name = pick(item.title);
      image.alt = name;
      tag.textContent = pick(item.tag);
      title.textContent = name;
      card.setAttribute("aria-label", t("gallery.open", { title: name }));
    });
  }

  #createItem(item, index) {
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
            createElement("span", { className: "bento-card__index", text: String(index + 1).padStart(2, "0") }),
          ],
        }),
      ],
    });
    this.on(card, "click", () => this.#onOpen(index));
    // remote images can fail (offline, blocked CDN): show a branded placeholder
    this.on(image, "error", () => card.classList.add("is-fallback"), { once: true });
    this.#cards.push({ card, image, tag, title });

    const sizeClass = SIZE_CLASS[item.size];
    return createElement("li", { className: sizeClass ? `bento__item ${sizeClass}` : "bento__item", children: [card] });
  }
}
