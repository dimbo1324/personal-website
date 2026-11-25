import { hook, queryAll } from "../../core/dom";
import { GalleryGrid } from "../../features/gallery/GalleryGrid";
import { Lightbox } from "../../features/gallery/Lightbox";
import { bindLightboxTriggers } from "../../features/gallery/LightboxTriggers";
import { GALLERY_ITEMS } from "../../data/gallery";
import type { AppContext } from "../types";

/** Bento gallery and the full-screen photo viewer. */
export function initGallery({ use, i18n, signal }: AppContext): void {
  const lightbox = use(
    hook("lightbox"),
    (root) =>
      new Lightbox(root, {
        items: GALLERY_ITEMS,
        i18n,
        elements: {
          image: hook<HTMLImageElement>("lightbox-image") ?? document.createElement("img"),
          title: hook("lightbox-title") ?? root,
          description: hook("lightbox-desc") ?? root,
          counter: hook("lightbox-counter") ?? root,
          strip: hook("lightbox-strip") ?? root,
          prev: hook<HTMLButtonElement>("lightbox-prev") ?? document.createElement("button"),
          next: hook<HTMLButtonElement>("lightbox-next") ?? document.createElement("button"),
          close: hook<HTMLButtonElement>("lightbox-close") ?? document.createElement("button"),
          mono: hook<HTMLButtonElement>("lightbox-mono") ?? document.createElement("button"),
        },
      }),
  );
  if (!lightbox) return;

  use(
    hook<HTMLUListElement>("gallery-grid"),
    (root) =>
      new GalleryGrid(root, {
        items: GALLERY_ITEMS,
        i18n,
        onOpen: (index) => lightbox.open(index),
        counter: hook("gallery-count"),
      }),
  );
  bindLightboxTriggers(queryAll<HTMLElement>("[data-open-lightbox]"), lightbox, signal);
}
