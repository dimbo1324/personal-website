import { Component } from "../../core/Component.js";
import { WindowDrag } from "./WindowDrag.js";
import { WindowResize } from "./WindowResize.js";

/**
 * Window chrome: open / minimise to dock / maximise / close, drag and resize.
 * State lives in the store ("widgetState": closed | open | minimized).
 */
export class ScadaWindow extends Component {
  #parts;

  /**
   * @param {HTMLElement} root
   * @param {{ dragHandle: HTMLElement, resizeGrip: HTMLElement, dock: HTMLButtonElement,
   *           openButtons: HTMLElement[], minimize: HTMLButtonElement, maximize: HTMLButtonElement,
   *           close: HTMLButtonElement, store: import("../../core/Store.js").Store }} parts
   */
  constructor(root, parts) {
    super(root);
    this.#parts = parts;
    this.store = parts.store;
  }

  mount() {
    const { dragHandle, resizeGrip, dock, openButtons, minimize, maximize, close } = this.#parts;
    const notMaximized = () => !this.store.get("widgetMaximized");

    new WindowDrag(this.root, dragHandle, notMaximized).attach(this.signal);
    new WindowResize(this.root, resizeGrip, notMaximized).attach(this.signal);

    openButtons.forEach((button) => this.on(button, "click", () => this.store.set("widgetState", "open")));
    this.on(dock, "click", () => this.store.set("widgetState", "open"));
    this.on(minimize, "click", () => this.store.set("widgetState", "minimized"));
    this.on(close, "click", () => this.store.set("widgetState", "closed"));
    this.on(maximize, "click", () => this.store.update("widgetMaximized", (maxed) => !maxed));
    this.on(document, "keydown", (event) => {
      if (event.key === "Escape" && this.store.get("widgetState") === "open") this.store.set("widgetState", "minimized");
    });

    this.own(this.store.subscribe("widgetState", (state) => this.#renderState(state)));
    this.own(this.store.subscribe("widgetMaximized", (maxed) => this.root.classList.toggle("is-maximized", maxed)));
    return super.mount();
  }

  #renderState(state) {
    const open = state === "open";
    this.root.classList.toggle("is-open", open);
    this.root.setAttribute("aria-hidden", String(!open));
    this.root.inert = !open;
    this.#parts.dock.classList.toggle("is-visible", state === "minimized");
    if (open) this.#parts.close.focus({ preventScroll: true });
  }
}
