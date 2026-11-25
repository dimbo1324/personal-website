// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { GalleryGrid } from "../src/scripts/site/features/gallery/GalleryGrid";
import { Lightbox } from "../src/scripts/site/features/gallery/Lightbox";
import { GALLERY_ITEMS } from "../src/scripts/site/data/gallery";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
const items = GALLERY_ITEMS.slice(0, 2);

afterEach(() => {
  document.body.className = "";
  document.body.innerHTML = "";
});

describe("GalleryGrid", () => {
  it("renders bento cards with localised labels and reports opens", () => {
    setBody('<ul data-js="grid"></ul><span data-js="count"></span>');
    const root = document.querySelector<HTMLUListElement>("[data-js=grid]");
    const counter = document.querySelector<HTMLElement>("[data-js=count]");
    if (!root || !counter) throw new Error("missing fixtures");
    const onOpen = vi.fn();

    new GalleryGrid(root, { items, onOpen, counter, i18n }).mount();
    const cards = root.querySelectorAll<HTMLButtonElement>(".bento-card");
    expect(cards).toHaveLength(2);
    expect(root.firstElementChild?.className).toContain("bento__item--feature");
    expect(cards[0]?.querySelector(".bento-card__title")?.textContent).toBe(
      i18n.pick(items[0]?.title ?? ""),
    );
    expect(counter.textContent).toContain("02 frames");

    cards[1]?.click();
    expect(onOpen).toHaveBeenCalledWith(1);

    i18n.set("es");
    expect(cards[0]?.querySelector(".bento-card__tag")?.textContent).toBe(
      i18n.pick(items[0]?.tag ?? ""),
    );
    i18n.set("en");
  });

  it("marks a card as fallback when its image fails", () => {
    setBody('<ul data-js="grid"></ul>');
    const root = document.querySelector<HTMLUListElement>("[data-js=grid]");
    if (!root) throw new Error("missing fixture");
    new GalleryGrid(root, { items: items.slice(0, 1), onOpen: () => undefined, i18n }).mount();
    const card = root.querySelector<HTMLElement>(".bento-card");
    card?.querySelector("img")?.dispatchEvent(new Event("error"));
    expect(card?.classList.contains("is-fallback")).toBe(true);
  });
});

interface LightboxFixture {
  lightbox: Lightbox;
  root: HTMLElement;
  image: HTMLImageElement;
  counter: HTMLElement;
  close: HTMLButtonElement;
  next: HTMLButtonElement;
  mono: HTMLButtonElement;
}

function mountLightbox(): LightboxFixture {
  setBody(`
    <div data-js="lightbox">
      <span data-js="counter"></span>
      <button data-js="prev"></button><button data-js="next"></button>
      <button data-js="close"></button><button data-js="mono"></button>
      <img data-js="image" /><span data-js="title"></span><span data-js="desc"></span>
      <div data-js="strip"></div>
    </div>
  `);
  const root = document.querySelector<HTMLElement>("[data-js=lightbox]");
  if (!root) throw new Error("missing fixture");
  const get = (name: string): HTMLElement => {
    const element = root.querySelector<HTMLElement>(`[data-js="${name}"]`);
    if (!element) throw new Error(`missing ${name}`);
    return element;
  };
  const lightbox = new Lightbox(root, {
    items,
    i18n,
    elements: {
      image: get("image") as HTMLImageElement,
      title: get("title"),
      description: get("desc"),
      counter: get("counter"),
      strip: get("strip"),
      prev: get("prev") as HTMLButtonElement,
      next: get("next") as HTMLButtonElement,
      close: get("close") as HTMLButtonElement,
      mono: get("mono") as HTMLButtonElement,
    },
  }).mount();
  return {
    lightbox,
    root,
    image: get("image") as HTMLImageElement,
    counter: get("counter"),
    close: get("close") as HTMLButtonElement,
    next: get("next") as HTMLButtonElement,
    mono: get("mono") as HTMLButtonElement,
  };
}

describe("Lightbox", () => {
  it("opens, navigates with buttons and closes with Escape", () => {
    const { lightbox, root, counter, next, image } = mountLightbox();
    lightbox.open(0);
    expect(root.classList.contains("is-open")).toBe(true);
    expect(counter.textContent).toBe("01 / 02");
    expect(image.alt).toBe(i18n.pick(items[0]?.title ?? ""));

    next.click();
    expect(counter.textContent).toBe("02 / 02");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(counter.textContent).toBe("01 / 02");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(root.classList.contains("is-open")).toBe(false);
    expect(root.inert).toBe(true);
  });

  it("toggles black and white mode", () => {
    const { image, mono } = mountLightbox();
    mono.click();
    expect(image.classList.contains("is-mono")).toBe(true);
    expect(mono.getAttribute("aria-pressed")).toBe("true");
    mono.click();
    expect(image.classList.contains("is-mono")).toBe(false);
  });
});
