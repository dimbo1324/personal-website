// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoCarousel } from "../src/scripts/site/features/media/VideoCarousel";
import { VideoClip } from "../src/scripts/site/features/media/catalog/VideoClip";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody, stubAnimationFrame, stubIntersectionObserver } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
let observer: ReturnType<typeof stubIntersectionObserver>;

function fixture(): VideoCarousel {
  setBody(`
    <div data-js="frame">
      <video data-js="reel"></video><video data-js="reel"></video>
      <img data-js="fallback" hidden /><span data-js="iris"></span><span data-js="segments" hidden></span>
      <span data-js="title"></span><span data-js="counter"></span><span data-js="concept" hidden></span>
    </div>
  `);
  const get = (name: string): HTMLElement => {
    const element = document.querySelector<HTMLElement>(`[data-js="${name}"]`);
    if (!element) throw new Error(`missing ${name}`);
    return element;
  };
  return new VideoCarousel(get("frame"), {
    videos: Array.from(document.querySelectorAll<HTMLVideoElement>("[data-js=reel]")),
    fallback: get("fallback") as HTMLImageElement,
    iris: get("iris"),
    segments: get("segments"),
    title: get("title"),
    counter: get("counter"),
    concept: get("concept"),
    i18n,
    viewport: {
      watch: vi.fn(() => () => undefined),
      unwatch: vi.fn(),
      disconnect: vi.fn(),
    } as never,
  }).mount();
}

const clips = [
  new VideoClip({ file: "01-a.mp4", src: "/a.mp4", title: "First" }),
  new VideoClip({ file: "02-b.mp4", src: "/b.mp4", title: "Second" }),
];

beforeEach(() => {
  Object.defineProperty(document, "readyState", { configurable: true, value: "complete" });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  stubAnimationFrame();
  observer = stubIntersectionObserver();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("VideoCarousel", () => {
  it("shows the fallback when there are no clips", () => {
    const carousel = fixture();
    carousel.setClips([], { title: "Field & stage highlights" });
    expect(document.querySelector("[data-js=frame]")?.classList.contains("is-empty")).toBe(true);
    expect((document.querySelector("[data-js=fallback]") as HTMLImageElement).hidden).toBe(false);
    expect(document.querySelector("[data-js=title]")?.textContent).toBe("Field & stage highlights");
    expect(carousel.activeVideo).toBeNull();
  });

  it("sets the first poster and reports the active video", () => {
    const carousel = fixture();
    carousel.setClips(clips, { title: "Fallback" });
    expect(carousel.index).toBe(0);
    expect(carousel.clips).toHaveLength(2);
    expect(carousel.activeVideo).toBeInstanceOf(HTMLVideoElement);
    expect(document.querySelector("[data-js=title]")?.textContent).toBe("First");
    expect(document.querySelector("[data-js=counter]")?.textContent).toBe("01 / 02");
    expect((document.querySelector("[data-js=segments]") as HTMLElement).hidden).toBe(false);
  });

  it("suspends and resumes playback through the viewport observer", () => {
    const carousel = fixture();
    carousel.setClips(clips, { title: "Fallback" });
    carousel.suspend();
    carousel.resume();
    expect(observer.instances).toHaveLength(0);
    expect(document.querySelectorAll(".media-frame__segment")).toHaveLength(2);
  });
});
