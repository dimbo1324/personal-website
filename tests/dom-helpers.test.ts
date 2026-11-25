// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  createElement,
  createSvgElement,
  hook,
  hooks,
  isHtmlElement,
  query,
  queryAll,
  requireHook,
} from "../src/scripts/site/core/dom";
import { createIcon } from "../src/scripts/site/core/icons";
import { setBody } from "./helpers/dom";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DOM helpers", () => {
  it("queries elements by selector and by data-js hook", () => {
    setBody('<div data-js="first"></div><div data-js="first"></div><p class="text">Hello</p>');
    expect(query<HTMLElement>(".text")?.textContent).toBe("Hello");
    expect(queryAll(".text")).toHaveLength(1);
    expect(hook("first")).toBeInstanceOf(HTMLElement);
    expect(hooks("first")).toHaveLength(2);
    expect(requireHook("first")).toBeInstanceOf(HTMLElement);
    expect(() => requireHook("missing")).toThrow('Missing [data-js="missing"]');
  });

  it("creates elements with text, attributes, dataset and children", () => {
    const child = createElement("span", { text: "child" });
    const element = createElement("button", {
      className: "btn",
      attrs: { type: "button", title: "Open" },
      dataset: { js: "submit" },
      children: [child],
    });
    expect(element.tagName).toBe("BUTTON");
    expect(element.className).toBe("btn");
    expect(element.textContent).toBe("child");
    expect(element.getAttribute("title")).toBe("Open");
    expect(element.dataset.js).toBe("submit");
    expect(element.firstElementChild).toBe(child);
  });

  it("creates SVG elements and sprite icons", () => {
    const circle = createSvgElement("circle", { r: 4, class: "dot" });
    expect(circle.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(circle.getAttribute("r")).toBe("4");

    const icon = createIcon("play", "sm");
    expect(icon.getAttribute("class")).toBe("icon icon--sm");
    expect(icon.querySelector("use")?.getAttribute("href")).toBe("/assets/icons/sprite.svg#i-play");
    expect(isHtmlElement(icon)).toBe(false);
    expect(isHtmlElement(document.createElement("div"))).toBe(true);
  });
});
