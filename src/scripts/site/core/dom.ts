export function query<T extends Element>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}

export function queryAll<T extends Element>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function hook(name: string, root?: ParentNode): HTMLElement | null;
export function hook<T extends Element>(name: string, root?: ParentNode): T | null;
export function hook<T extends Element = HTMLElement>(
  name: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(`[data-js="${name}"]`);
}

export function hooks(name: string, root?: ParentNode): HTMLElement[];
export function hooks<T extends Element>(name: string, root?: ParentNode): T[];
export function hooks<T extends Element = HTMLElement>(
  name: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(`[data-js="${name}"]`));
}

interface CreateElementOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
  dataset?: Record<string, string>;
  children?: readonly Node[];
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: CreateElementOptions = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.attrs) {
    for (const [name, value] of Object.entries(options.attrs)) element.setAttribute(name, value);
  }
  if (options.dataset) Object.assign(element.dataset, options.dataset);
  if (options.children) element.append(...options.children);
  return element;
}

export const SVG_NS = "http://www.w3.org/2000/svg";

export function createSvgElement(
  tag: string,
  attrs: Record<string, string | number> = {},
): SVGElement {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value));
  return element;
}

export function isHtmlElement(value: Element | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function requireHook<T extends Element = HTMLElement>(
  name: string,
  root: ParentNode = document,
): T {
  const element = hook<T>(name, root);
  if (!element) throw new Error(`Missing [data-js="${name}"] element`);
  return element;
}
