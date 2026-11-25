import { Component } from "../../core/component";
import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import { WindowDrag } from "./WindowDrag";
import { WindowResize } from "./WindowResize";

interface ScadaWindowParts {
  readonly dragHandle: HTMLElement;
  readonly resizeGrip: HTMLElement;
  readonly dock: HTMLButtonElement;
  readonly openButtons: readonly HTMLElement[];
  readonly minimize: HTMLButtonElement;
  readonly maximize: HTMLButtonElement;
  readonly close: HTMLButtonElement;
  readonly store: Store<AppState>;
}

/** Window chrome: open / minimise to dock / maximise / close, drag and resize. */
export class ScadaWindow extends Component<HTMLElement> {
  readonly #parts: ScadaWindowParts;
  readonly #store: Store<AppState>;

  constructor(root: HTMLElement, parts: ScadaWindowParts) {
    super(root);
    this.#parts = parts;
    this.#store = parts.store;
  }

  override mount(): this {
    const { dragHandle, resizeGrip, dock, openButtons, minimize, maximize, close } = this.#parts;
    const notMaximized = (): boolean => !this.#store.get("widgetMaximized");

    new WindowDrag(this.root, dragHandle, notMaximized).attach(this.signal);
    new WindowResize(this.root, resizeGrip, notMaximized).attach(this.signal);

    for (const button of openButtons) {
      this.on(button, "click", () => this.#store.set("widgetState", "open"));
    }
    this.on(dock, "click", () => this.#store.set("widgetState", "open"));
    this.on(minimize, "click", () => this.#store.set("widgetState", "minimized"));
    this.on(close, "click", () => this.#store.set("widgetState", "closed"));
    this.on(maximize, "click", () => this.#store.update("widgetMaximized", (maxed) => !maxed));
    this.on(document, "keydown", (event) => {
      if (event.key === "Escape" && this.#store.get("widgetState") === "open") {
        this.#store.set("widgetState", "minimized");
      }
    });

    this.own(this.#store.subscribe("widgetState", (state) => this.#renderState(state)));
    this.own(
      this.#store.subscribe("widgetMaximized", (maxed) => {
        this.root.classList.toggle("is-maximized", maxed);
      }),
    );
    return super.mount();
  }

  #renderState(state: AppState["widgetState"]): void {
    const open = state === "open";
    this.root.classList.toggle("is-open", open);
    this.root.setAttribute("aria-hidden", String(!open));
    this.root.inert = !open;
    this.#parts.dock.classList.toggle("is-visible", state === "minimized");
    if (open) this.#parts.close.focus({ preventScroll: true });
  }
}
