type Listener<T> = (value: T, previous: T | undefined) => void;

export class Store<TState extends object> {
  readonly #state: TState;
  readonly #listeners = new Map<keyof TState, Set<(value: unknown, previous: unknown) => void>>();

  constructor(initialState: TState) {
    this.#state = { ...initialState };
  }

  get<K extends keyof TState>(key: K): TState[K] {
    return this.#state[key];
  }

  snapshot(): Readonly<TState> {
    return Object.freeze({ ...this.#state });
  }

  set<K extends keyof TState>(key: K, value: TState[K]): void {
    if (Object.is(this.#state[key], value)) return;
    const previous = this.#state[key];
    this.#state[key] = value;
    this.#listeners.get(key)?.forEach((listener) => listener(value, previous));
  }

  update<K extends keyof TState>(key: K, updater: (value: TState[K]) => TState[K]): void {
    this.set(key, updater(this.#state[key]));
  }

  subscribe<K extends keyof TState>(
    key: K,
    listener: Listener<TState[K]>,
    options: { immediate?: boolean } = {},
  ): () => void {
    const bucket =
      this.#listeners.get(key) ?? new Set<(value: unknown, previous: unknown) => void>();
    this.#listeners.set(key, bucket);
    const wrapped = (value: unknown, previous: unknown): void => {
      listener(value as TState[K], previous as TState[K] | undefined);
    };
    bucket.add(wrapped);
    if (options.immediate ?? true) listener(this.#state[key], undefined);
    return () => bucket.delete(wrapped);
  }
}
