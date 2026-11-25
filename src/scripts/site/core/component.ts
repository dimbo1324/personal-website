import { reportError } from "./log";

type Disposer = () => void;

export abstract class Component<TRoot extends Element = HTMLElement> {
  readonly root: TRoot;
  readonly #abortController = new AbortController();
  readonly #disposers: Disposer[] = [];
  #mounted = false;

  constructor(root: TRoot) {
    if (!(root instanceof Element)) {
      throw new TypeError(`${new.target.name}: root element is required`);
    }
    this.root = root;
  }

  get isMounted(): boolean {
    return this.#mounted;
  }

  get signal(): AbortSignal {
    return this.#abortController.signal;
  }

  on<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): this;
  on<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    handler: (event: DocumentEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): this;
  on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions,
  ): this;
  on(
    target: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: AddEventListenerOptions,
  ): this;
  on(
    target: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options: AddEventListenerOptions = {},
  ): this {
    target.addEventListener(type, handler, { ...options, signal: this.signal });
    return this;
  }

  own(disposer: Disposer | undefined): Disposer | undefined {
    if (typeof disposer === "function") this.#disposers.push(disposer);
    return disposer;
  }

  mount(): this {
    this.#mounted = true;
    return this;
  }

  protected onDestroy(): void {
    // Optional lifecycle hook for subclasses.
  }

  destroy(): void {
    this.onDestroy();
    this.#abortController.abort();
    for (const dispose of this.#disposers.splice(0)) {
      try {
        dispose();
      } catch (error) {
        reportError("Component", error);
      }
    }
    this.#mounted = false;
  }
}
