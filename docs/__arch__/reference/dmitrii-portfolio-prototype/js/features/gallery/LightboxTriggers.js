/**
 * Any element with [data-open-lightbox="n"] opens the lightbox at n
 * (e.g. the hero media frame). Keyboard activation is native (<a>/<button>).
 */
export function bindLightboxTriggers(elements, lightbox, signal) {
  elements.forEach((element) => {
    element.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        lightbox.open(Number(element.dataset.openLightbox) || 0);
      },
      { signal },
    );
  });
}
