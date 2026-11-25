// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../src/scripts/site/features/analytics/AnalyticsService";
import { createAnalyticsProvider } from "../src/scripts/site/features/analytics/createAnalyticsProvider";
import { visitorOptedOut } from "../src/scripts/site/features/analytics/privacySignals";
import { ANALYTICS_EVENTS } from "../src/scripts/site/features/analytics/events";
import type { AnalyticsEnvironment } from "../src/scripts/site/config/env";
import type { AnalyticsProvider } from "../src/scripts/site/features/analytics/providers/AnalyticsProvider";

const config: AnalyticsEnvironment = {
  provider: "none",
  domain: null,
  src: null,
  websiteId: null,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("AnalyticsService", () => {
  it("tracks explicit events and data-track clicks", () => {
    document.documentElement.lang = "en";
    const provider: AnalyticsProvider = {
      load: vi.fn().mockResolvedValue(undefined),
      track: vi.fn(),
    };
    const service = new AnalyticsService(provider);
    const dispose = service.start({ root: document });
    document.body.innerHTML = '<button data-track="cv_download"></button><button></button>';

    service.track(ANALYTICS_EVENTS.theaterOpen, { lang: "en" });
    document.querySelector("button")?.click();
    expect(provider.track).toHaveBeenCalledWith("theater_open", { lang: "en" });
    expect(provider.track).toHaveBeenCalledWith("cv_download", { lang: "en" });
    expect(provider.track).toHaveBeenCalledTimes(2);

    service.track(null);
    expect(provider.track).toHaveBeenCalledTimes(2);
    dispose();
    document.querySelector("button")?.click();
    expect(provider.track).toHaveBeenCalledTimes(2);
  });

  it("never throws when a provider fails to load", async () => {
    const provider: AnalyticsProvider = {
      load: vi.fn().mockRejectedValue(new Error("offline")),
      track: vi.fn(),
    };
    Object.defineProperty(document, "readyState", { configurable: true, value: "complete" });
    new AnalyticsService(provider).start({ root: document });
    await vi.waitFor(() => expect(provider.load).toHaveBeenCalled());
  });
});

describe("analytics configuration", () => {
  it("uses the null provider when opted out or unconfigured", () => {
    expect(createAnalyticsProvider(config, { optedOut: true }).constructor.name).toBe(
      "NullProvider",
    );
    expect(createAnalyticsProvider(config, { optedOut: false }).constructor.name).toBe(
      "NullProvider",
    );
    expect(
      createAnalyticsProvider({ ...config, provider: "unknown" }, { optedOut: false }).constructor
        .name,
    ).toBe("NullProvider");
  });

  it("builds real providers when configured", () => {
    expect(
      createAnalyticsProvider(
        { ...config, provider: "plausible", domain: "example.com" },
        { optedOut: false },
      ).constructor.name,
    ).toBe("PlausibleProvider");
    expect(
      createAnalyticsProvider(
        { ...config, provider: "umami", websiteId: "id" },
        { optedOut: false },
      ).constructor.name,
    ).toBe("UmamiProvider");
  });

  it("honours Do Not Track and Global Privacy Control", () => {
    const nav = { doNotTrack: "1", globalPrivacyControl: false } as unknown as Navigator;
    const win = {} as Window;
    expect(visitorOptedOut(nav, win)).toBe(true);

    const gpcNav = { doNotTrack: "0", globalPrivacyControl: true } as unknown as Navigator;
    expect(visitorOptedOut(gpcNav, win)).toBe(true);
    expect(
      visitorOptedOut(
        { doNotTrack: "0", globalPrivacyControl: false } as unknown as Navigator,
        win,
      ),
    ).toBe(false);
  });
});
