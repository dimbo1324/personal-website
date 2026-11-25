let locks = 0;

export function lockScroll(): void {
  locks += 1;
  document.body.classList.add("is-scroll-locked");
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.body.classList.remove("is-scroll-locked");
}
