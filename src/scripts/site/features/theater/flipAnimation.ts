interface FlipOptions {
  readonly duration?: number;
  readonly reverse?: boolean;
}

/** FLIP shared-element transition from a prior rectangle to the current box. */
export function flipFromRect(
  element: HTMLElement,
  from: DOMRect,
  { duration = 720, reverse = false }: FlipOptions = {},
): Animation {
  const to = element.getBoundingClientRect();
  const invert = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  const keyframes = [{ transform: invert, borderRadius: "14px" }, { transform: "none" }];
  return element.animate(reverse ? keyframes.slice().reverse() : keyframes, {
    duration,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: reverse ? "forwards" : "none",
  });
}
