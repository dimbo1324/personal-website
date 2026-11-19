/**
 * Reference-counted body scroll lock: the drawer and the lightbox can both
 * request a lock without unlocking each other.
 */
let locks = 0;

export function lockScroll() {
  locks += 1;
  document.body.classList.add("is-scroll-locked");
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.body.classList.remove("is-scroll-locked");
}
