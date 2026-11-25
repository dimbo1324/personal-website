// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { Accordion } from "../src/scripts/site/features/dossier/Accordion";
import { Tabs } from "../src/scripts/site/features/dossier/Tabs";
import { setBody } from "./helpers/dom";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Accordion", () => {
  it("keeps a single row open and keeps aria state in sync", () => {
    setBody(`
      <ol data-js="accordion">
        <li class="timeline__item is-open"><button class="timeline__trigger" aria-expanded="true"></button></li>
        <li class="timeline__item"><button class="timeline__trigger" aria-expanded="false"></button></li>
      </ol>
    `);
    const root = document.querySelector<HTMLElement>("[data-js=accordion]");
    if (!root) throw new Error("missing fixture");
    new Accordion(root).mount();
    const items = root.querySelectorAll<HTMLElement>(".timeline__item");

    items[1]?.querySelector("button")?.click();
    expect(items[0]?.classList.contains("is-open")).toBe(false);
    expect(items[1]?.classList.contains("is-open")).toBe(true);
    expect(items[0]?.querySelector("button")?.getAttribute("aria-expanded")).toBe("false");
    expect(items[1]?.querySelector("button")?.getAttribute("aria-expanded")).toBe("true");

    items[1]?.querySelector("button")?.click();
    expect(items[1]?.classList.contains("is-open")).toBe(false);
  });
});

describe("Tabs", () => {
  it("switches panes on click and keyboard", () => {
    setBody(`
      <div data-js="tabs" role="tablist">
        <span class="segmented__indicator"></span>
        <button role="tab" class="is-active" data-tab="ot" aria-selected="true"></button>
        <button role="tab" data-tab="it" aria-selected="false" tabindex="-1"></button>
        <button role="tab" data-tab="edu" aria-selected="false" tabindex="-1"></button>
      </div>
      <div data-pane="ot" class="is-active"></div>
      <div data-pane="it" hidden></div>
      <div data-pane="edu" hidden></div>
    `);
    const root = document.querySelector<HTMLElement>("[data-js=tabs]");
    const panes = Array.from(document.querySelectorAll<HTMLElement>("[data-pane]"));
    if (!root) throw new Error("missing fixture");
    new Tabs(root, panes).mount();
    const tabs = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    tabs[1]?.click();
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]?.tabIndex).toBe(0);
    expect(panes[0]?.hidden).toBe(true);
    expect(panes[1]?.hidden).toBe(false);

    tabs[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");
    expect(panes[2]?.hidden).toBe(false);

    tabs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");
  });
});
