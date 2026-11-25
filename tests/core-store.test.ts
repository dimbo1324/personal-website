import { describe, expect, it, vi } from "vitest";
import { Store } from "../src/scripts/site/core/store";

interface State {
  count: number;
  label: string;
}

const makeStore = (): Store<State> => new Store<State>({ count: 0, label: "start" });

describe("Store", () => {
  it("reads values and returns a frozen snapshot", () => {
    const store = makeStore();
    expect(store.get("count")).toBe(0);
    expect(store.get("label")).toBe("start");
    expect(Object.isFrozen(store.snapshot())).toBe(true);
    expect(store.snapshot()).toEqual({ count: 0, label: "start" });
  });

  it("notifies subscribers with the new and previous values", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe("count", listener);
    expect(listener).toHaveBeenCalledWith(0, undefined);

    store.set("count", 2);
    expect(listener).toHaveBeenCalledWith(2, 0);
    expect(listener).toHaveBeenCalledTimes(2);

    store.set("count", 2);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("supports functional updates and opting out of the immediate call", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe("label", listener, { immediate: false });
    expect(listener).not.toHaveBeenCalled();

    store.update("label", (value) => `${value}-next`);
    expect(store.get("label")).toBe("start-next");
    expect(listener).toHaveBeenCalledWith("start-next", "start");
  });

  it("stops notifying after unsubscribe", () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe("count", listener);
    unsubscribe();
    store.set("count", 5);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("keeps subscribers of different keys independent", () => {
    const store = makeStore();
    const countListener = vi.fn();
    const labelListener = vi.fn();
    store.subscribe("count", countListener);
    store.subscribe("label", labelListener, { immediate: false });

    store.set("label", "changed");
    expect(labelListener).toHaveBeenCalledTimes(1);
    expect(countListener).toHaveBeenCalledTimes(1);
  });
});
