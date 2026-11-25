import { createSvgElement } from "./dom";

const SPRITE_URL = "/assets/icons/sprite.svg";

export function createIcon(name: string, modifier?: "sm" | "lg"): SVGSVGElement {
  const svg = createSvgElement("svg", {
    class: modifier ? `icon icon--${modifier}` : "icon",
    "aria-hidden": "true",
    focusable: "false",
  }) as SVGSVGElement;
  const use = createSvgElement("use", { href: `${SPRITE_URL}#i-${name}` });
  svg.append(use);
  return svg;
}
