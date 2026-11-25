// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadScript } from "../src/scripts/site/features/analytics/loadScript";
import { NullProvider } from "../src/scripts/site/features/analytics/providers/NullProvider";
import { PlausibleProvider } from "../src/scripts/site/features/analytics/providers/PlausibleProvider";
import { UmamiProvider } from "../src/scripts/site/features/analytics/providers/UmamiProvider";

afterEach(() => {
  document.head.innerHTML = "";
  vi.restoreAllMocks();
});

describe("loadScript", () => {
  it("appends an async script and resolves on load", async () => {
    const promise = loadScript("https://cdn.invalid/script.js", { domain: "example.com" });
    const script = document.head.querySelector("script");
    expect(script?.async).toBe(true);
    expect(script?.dataset.domain).toBe("example.com");
    script?.dispatchEvent(new Event("load"));
    await expect(promise).resolves.toBeUndefined();
  });

  it("rejects when the script fails", async () => {
    const promise = loadScript("https://cdn.invalid/broken.js");
    document.head.querySelector("script")?.dispatchEvent(new Event("error"));
    await expect(promise).rejects.toThrow("Failed to load");
  });
});

describe("analytics providers", () => {
  it("NullProvider does nothing", () => {
    const provider = new NullProvider();
    expect(provider.track("event")).toBeUndefined();
  });

  it("PlausibleProvider queues events and tracks after load", async () => {
    const provider = new PlausibleProvider({
      domain: "example.com",
      src: "https://cdn.invalid/plausible.js",
    });
    provider.track("early");
    const load = provider.load();
    const script = document.head.querySelector("script");
    script?.dispatchEvent(new Event("load"));
    await load;

    const tracked = vi.fn();
    (window as Window & { plausible?: (...args: unknown[]) => void }).plausible = tracked;
    provider.track("late", { lang: "es" });
    expect(tracked).toHaveBeenCalledWith("late", { props: { lang: "es" } });
  });

  it("UmamiProvider flushes queued events after load", async () => {
    const provider = new UmamiProvider({
      websiteId: "site-id",
      src: "https://cdn.invalid/umami.js",
    });
    provider.track("queued");
    const tracked = vi.fn();
    (window as Window & { umami?: { track(...args: unknown[]): void } }).umami = { track: tracked };

    const load = provider.load();
    document.head.querySelector("script")?.dispatchEvent(new Event("load"));
    await load;
    expect(tracked).toHaveBeenCalledWith("queued", undefined);
  });

  it("requires configuration for the real providers", () => {
    expect(() => new PlausibleProvider({ domain: null, src: null })).toThrow(
      "PUBLIC_ANALYTICS_DOMAIN",
    );
    expect(() => new UmamiProvider({ websiteId: null, src: null })).toThrow(
      "PUBLIC_ANALYTICS_WEBSITE_ID",
    );
  });
});
