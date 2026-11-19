/**
 * FLIP ("First, Last, Invert, Play") shared-element transition:
 * animates `element` from the rectangle `from` to its current layout box.
 * @param {HTMLElement} element
 * @param {DOMRect} from
 * @param {{ duration?: number, reverse?: boolean }} [options]
 * @returns {Animation}
 */
export function flipFromRect(element, from, { duration = 720, reverse = false } = {}) {
  const to = element.getBoundingClientRect();
  const invert = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  const keyframes = [{ transform: invert, borderRadius: "14px" }, { transform: "none" }];
  return element.animate(reverse ? keyframes.slice().reverse() : keyframes, {
    duration,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fill: reverse ? "forwards" : "none",
  });
}
