import { createSvgElement } from "./dom.js";

const SPRITE_URL = "assets/icons/sprite.svg";

/**
 * Build an icon that references the shared SVG sprite.
 * @param {string} name   symbol name without the "i-" prefix
 * @param {string} [modifier] e.g. "sm" | "lg"
 */
export function createIcon(name, modifier) {
  const svg = createSvgElement("svg", {
    class: modifier ? `icon icon--${modifier}` : "icon",
    "aria-hidden": "true",
    focusable: "false",
  });
  const use = createSvgElement("use", { href: `${SPRITE_URL}#i-${name}` });
  svg.append(use);
  return svg;
}
