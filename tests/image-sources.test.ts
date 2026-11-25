import { describe, expect, it } from "vitest";
import {
  localImage,
  remoteImage,
  unsplashUrl,
} from "../src/scripts/site/features/media/images/imageSources";
import { ImageSampler } from "../src/scripts/site/features/hero/backdrop/ImageSampler";

describe("image sources", () => {
  it("builds local srcsets with the largest file last", () => {
    const image = localImage("keynote", { full: 1280, widths: [640] });
    expect(image.src).toBe("/assets/images/keynote.webp");
    expect(image.srcset).toBe(
      "/assets/images/keynote-640.webp 640w, /assets/images/keynote.webp 1280w",
    );
    expect(image.remote).toBe(false);
  });

  it("serves committed remote images locally", () => {
    const image = remoteImage("hero-plant");
    expect(image.remote).toBe(false);
    expect(image.src).toBe("/assets/images/remote/hero-plant-1600.webp");
    expect(image.srcset).toContain("480w");
    expect(image.srcset).toContain("1600w");
  });

  it("falls back to the CDN when a local copy is not listed", () => {
    const image = remoteImage("hero-plant", { local: [] });
    expect(image.remote).toBe(true);
    expect(image.src).toBe(unsplashUrl("photo-1518709268805-4e9042af9f23", 1600));
    expect(() => remoteImage("unknown" as "hero-plant")).toThrow();
  });

  it("reproduces object-fit: cover crops", () => {
    expect(ImageSampler.coverCrop(1600, 900, 1000, 1000)).toEqual({
      sx: 350,
      sy: 0,
      sw: 900,
      sh: 900,
    });
    expect(ImageSampler.coverCrop(800, 800, 1600, 800)).toEqual({
      sx: 0,
      sy: 200,
      sw: 800,
      sh: 400,
    });
  });
});
