// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { Component } from "../src/scripts/site/core/component";
import { setBody } from "./helpers/dom";

class TestComponent extends Component<HTMLElement> {
  started = 0;
  destroyed = 0;

  override mount(): this {
    this.started += 1;
    this.on(this.root, "click", () => this.started++);
    this.own(() => this.destroyed++);
    return super.mount();
  }

  protected override onDestroy(): void {
    this.destroyed += 1;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("Component", () => {
  it("requires an Element root", () => {
    expect(() => new TestComponent(null as unknown as HTMLElement)).toThrow(
      "root element is required",
    );
  });

  it("mounts once, tracks isMounted and runs disposers on destroy", () => {
    setBody('<button data-js="target"></button>');
    const root = document.querySelector<HTMLElement>("[data-js=target]");
    if (!root) throw new Error("missing fixture");
    const component = new TestComponent(root);

    expect(component.isMounted).toBe(false);
    component.mount();
    expect(component.isMounted).toBe(true);
    expect(component.started).toBe(1);

    root.click();
    expect(component.started).toBe(2);

    component.destroy();
    expect(component.isMounted).toBe(false);
    expect(component.signal.aborted).toBe(true);
    expect(component.destroyed).toBe(2);

    root.click();
    expect(component.started).toBe(2);
  });

  it("keeps multiple components isolated", () => {
    setBody("<button></button><button></button>");
    const roots = document.querySelectorAll<HTMLElement>("button");
    const first = new TestComponent(roots[0] as HTMLElement).mount();
    const second = new TestComponent(roots[1] as HTMLElement).mount();
    first.destroy();
    expect(first.signal.aborted).toBe(true);
    expect(second.signal.aborted).toBe(false);
  });
});
