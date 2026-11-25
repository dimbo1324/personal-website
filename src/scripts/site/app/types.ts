import type { createServices } from "./createServices";

export type Services = ReturnType<typeof createServices>;

export interface AppContext extends Services {
  use<TRoot extends Element, TComponent>(
    root: TRoot | null,
    factory: (root: TRoot) => TComponent,
  ): TComponent | null;
  dispose(disposer: (() => void) | undefined): void;
  readonly signal: AbortSignal;
}

export type InitModule = (context: AppContext) => void | Promise<void>;
