/** DOM helpers. All element creation goes through `createElement`
 *  (textContent only — never innerHTML), which keeps the app XSS-safe. */

export const qs = (selector, root = document) => root.querySelector(selector);

export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Query a `data-js="name"` hook. */
export const hook = (name, root = document) => root.querySelector(`[data-js="${name}"]`);

export const hooks = (name, root = document) => Array.from(root.querySelectorAll(`[data-js="${name}"]`));

/**
 * @param {string} tag
 * @param {{ className?: string, text?: string, attrs?: Record<string,string>, dataset?: Record<string,string>, children?: Node[] }} [options]
 */
export function createElement(tag, { className, text, attrs, dataset, children } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  if (attrs) Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value));
  if (dataset) Object.assign(element.dataset, dataset);
  if (children) element.append(...children);
  return element;
}

export const SVG_NS = "http://www.w3.org/2000/svg";

/** @param {string} tag @param {Record<string, string|number>} [attrs] */
export function createSvgElement(tag, attrs = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, String(value)));
  return element;
}
