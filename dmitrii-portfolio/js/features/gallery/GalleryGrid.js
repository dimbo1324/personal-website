import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";

const SIZE_CLASS = Object.freeze({ feature: "bento__item--feature", tall: "bento__item--tall" });

/**
 * Builds the bento gallery from data (DOM API only, no innerHTML).
 * Every card is a .tile, so it gets the laser hover from tile.css.
 */
export class GalleryGrid extends Component {
  #items;
  #onOpen;

  /**
   * @param {HTMLUListElement} root
   * @param {{ items: readonly object[], onOpen: (index: number) => void, counter?: HTMLElement }} options
   */
  constructor(root, { items, onOpen, counter }) {
    super(root);
    this.#items = items;
    this.#onOpen = onOpen;
    if (counter) counter.textContent = String(items.length).padStart(2, "0");
  }

  mount() {
    const fragment = document.createDocumentFragment();
    this.#items.forEach((item, index) => fragment.append(this.#createItem(item, index)));
    this.root.append(fragment);
    return super.mount();
  }

  #createItem(item, index) {
    const image = createElement("img", {
      attrs: { src: item.src, alt: item.title, loading: "lazy", decoding: "async" },
    });
    if (item.position) image.style.objectPosition = item.position;

    const card = createElement("button", {
      className: "bento-card tile",
      attrs: { type: "button", "aria-label": `Open “${item.title}”` },
      children: [
        createElement("span", { className: "bento-card__media", children: [image] }),
        createElement("span", {
          className: "bento-card__meta",
          children: [
            createElement("span", {
              children: [
                createElement("span", { className: "bento-card__tag", text: item.tag }),
                createElement("span", { className: "bento-card__title", text: item.title }),
              ],
            }),
            createElement("span", { className: "bento-card__index", text: String(index + 1).padStart(2, "0") }),
          ],
        }),
      ],
    });
    this.on(card, "click", () => this.#onOpen(index));
    // remote images can fail (offline, blocked CDN): show a branded placeholder
    this.on(image, "error", () => card.classList.add("is-fallback"), { once: true });

    const sizeClass = SIZE_CLASS[item.size];
    return createElement("li", { className: sizeClass ? `bento__item ${sizeClass}` : "bento__item", children: [card] });
  }
}
