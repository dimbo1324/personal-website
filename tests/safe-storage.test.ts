// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { SafeStorage } from "../src/scripts/site/core/storage";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("SafeStorage", () => {
  it("namespaces keys and reads back strings", () => {
    const storage = new SafeStorage("dp");
    expect(storage.read("theme")).toBeNull();
    expect(storage.read("theme", "dark")).toBe("dark");
    expect(storage.write("theme", "light")).toBe(true);
    expect(window.localStorage.getItem("dp.theme")).toBe("light");
    expect(storage.read("theme")).toBe("light");
  });

  it("stringifies numbers and booleans", () => {
    const storage = new SafeStorage("dp");
    storage.write("cycle", 7);
    storage.write("ready", true);
    expect(storage.read("cycle")).toBe("7");
    expect(storage.read("ready")).toBe("true");
  });

  it("degrades to a no-op when storage throws", () => {
    const storage = new SafeStorage("dp");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(storage.read("theme", "dark")).toBe("dark");
    expect(storage.write("theme", "light")).toBe(false);
  });
});
