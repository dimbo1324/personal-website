import { hook, qsa } from "../../core/dom.js";
import { GalleryGrid } from "../../features/gallery/GalleryGrid.js";
import { Lightbox } from "../../features/gallery/Lightbox.js";
import { bindLightboxTriggers } from "../../features/gallery/LightboxTriggers.js";
import { GALLERY_ITEMS } from "../../data/gallery.js";

/** @param {import("../App.js").AppContext} ctx */
export function initGallery({ use, i18n, signal }) {
  const lightbox = use(
    hook("lightbox"),
    (root) =>
      new Lightbox(root, {
        items: GALLERY_ITEMS,
        i18n,
        elements: {
          image: hook("lightbox-image"),
          title: hook("lightbox-title"),
          description: hook("lightbox-desc"),
          counter: hook("lightbox-counter"),
          strip: hook("lightbox-strip"),
          prev: hook("lightbox-prev"),
          next: hook("lightbox-next"),
          close: hook("lightbox-close"),
          mono: hook("lightbox-mono"),
        },
      }),
  );
  if (!lightbox) return;

  use(
    hook("gallery-grid"),
    (root) =>
      new GalleryGrid(root, {
        items: GALLERY_ITEMS,
        i18n,
        onOpen: (index) => lightbox.open(index),
        counter: hook("gallery-count"),
      }),
  );
  bindLightboxTriggers(qsa("[data-open-lightbox]"), lightbox, signal);
}
