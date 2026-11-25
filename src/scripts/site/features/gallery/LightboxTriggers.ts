import type { Lightbox } from "./Lightbox";

/** Any element with [data-open-lightbox="n"] opens the lightbox at n. */
export function bindLightboxTriggers(
  elements: readonly HTMLElement[],
  lightbox: Lightbox,
  signal: AbortSignal,
): void {
  for (const element of elements) {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        lightbox.open(Number(element.dataset.openLightbox) || 0);
      },
      { signal },
    );
  }
}
