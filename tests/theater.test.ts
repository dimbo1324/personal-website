// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TheaterPlaylist } from "../src/scripts/site/features/theater/TheaterPlaylist";
import { TheaterPlayer } from "../src/scripts/site/features/theater/TheaterPlayer";
import { Theater } from "../src/scripts/site/features/theater/Theater";
import { TheaterLauncher } from "../src/scripts/site/features/theater/TheaterLauncher";
import { VideoClip } from "../src/scripts/site/features/media/catalog/VideoClip";
import { GALLERY_ITEMS } from "../src/scripts/site/data/gallery";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody, stubElementAnimation, restoreElementAnimation } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });
const clip = new VideoClip({
  file: "01-intro.mp4",
  src: "/assets/video/hero/01-intro.mp4",
  poster: "/assets/video/hero/01-intro.webp",
  title: { en: "Intro", es: "Intro", ru: "Вступление" },
});

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  Element.prototype.scrollIntoView = vi.fn();
  stubElementAnimation();
});

afterEach(() => {
  restoreElementAnimation();
  vi.restoreAllMocks();
  document.documentElement.className = "";
  document.body.innerHTML = "";
});

describe("TheaterPlaylist", () => {
  it("puts clips before photos and wraps around", () => {
    const playlist = new TheaterPlaylist([clip], GALLERY_ITEMS.slice(0, 2), { compact: true });
    expect(playlist.length).toBe(3);
    expect(playlist.items[0]?.type).toBe("video");
    expect(playlist.items[1]?.type).toBe("image");
    expect(playlist.nextVideoIndex).toBe(0);

    playlist.select(2);
    expect(playlist.index).toBe(2);
    playlist.select(3);
    expect(playlist.index).toBe(0);

    playlist.setThumb(0, "blob:poster");
    expect(playlist.items[0]?.thumb).toBe("blob:poster");
  });
});

describe("TheaterPlayer", () => {
  it("loads, toggles, seeks and reports progress", () => {
    setBody(`
      <video data-js="video"></video>
      <div data-js="controls"><button data-js="play"><use data-js="icon"></use></button>
      <div data-js="progress"><span data-js="fill"></span></div><span data-js="time"></span></div>
    `);
    const get = (name: string): HTMLElement => {
      const element = document.querySelector<HTMLElement>(`[data-js="${name}"]`);
      if (!element) throw new Error(`missing ${name}`);
      return element;
    };
    const video = get("video") as HTMLVideoElement;
    let paused = true;
    Object.defineProperty(video, "paused", { configurable: true, get: () => paused });
    Object.defineProperty(video, "duration", { configurable: true, value: 100 });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => {
      paused = false;
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
      paused = true;
    });
    const player = new TheaterPlayer(
      video,
      {
        controls: get("controls"),
        play: get("play") as HTMLButtonElement,
        playIcon: get("icon") as unknown as SVGUseElement,
        progress: get("progress"),
        fill: get("fill"),
        time: get("time"),
      },
      i18n,
    ).attach();

    player.load("/assets/video/hero/01-intro.mp4", "/assets/video/hero/01-intro.webp");
    expect(video.src).toContain("01-intro.mp4");
    expect(video.poster).toContain("01-intro.webp");

    player.toggle();
    expect(video.paused).toBe(false);
    player.toggle();
    expect(video.paused).toBe(true);

    video.currentTime = 25;
    video.dispatchEvent(new Event("timeupdate"));
    expect(get("time").textContent).toBe("0:25 / 1:40");
    expect((get("fill") as HTMLElement).style.width).toBe("25%");

    player.setVisible(false);
    expect(get("controls").hidden).toBe(true);
    player.destroy();
  });
});

describe("Theater", () => {
  it("opens an image item and closes it again", () => {
    setBody(`
      <div data-js="theater">
        <div data-js="backdrop"></div><div data-js="stage"><video></video><img /></div>
        <button data-js="close"></button><button data-js="prev"></button><button data-js="next"></button>
        <span data-js="title"></span><p data-js="caption"></p><span data-js="counter"></span>
        <span data-js="concept"></span><ul data-js="rail"></ul>
        <div data-js="controls"><button data-js="play"><svg><use data-js="icon"></use></svg></button>
        <div data-js="progress"><span data-js="fill"></span></div><span data-js="time"></span></div>
      </div>
    `);
    const get = (name: string): HTMLElement => {
      const element = document.querySelector<HTMLElement>(`[data-js="${name}"]`);
      if (!element) throw new Error(`missing ${name}`);
      return element;
    };
    const player = new TheaterPlayer(
      get("stage").querySelector("video") as HTMLVideoElement,
      {
        controls: get("controls"),
        play: get("play") as HTMLButtonElement,
        playIcon: get("icon") as unknown as SVGUseElement,
        progress: get("progress"),
        fill: get("fill"),
        time: get("time"),
      },
      i18n,
    );
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const theater = new Theater(get("theater"), {
      playlist: new TheaterPlaylist([], GALLERY_ITEMS.slice(0, 1)),
      player,
      i18n,
      background: [],
      elements: {
        stage: get("stage"),
        image: get("stage").querySelector("img") as HTMLImageElement,
        title: get("title"),
        caption: get("caption"),
        concept: get("concept"),
        counter: get("counter"),
        rail: get("rail"),
        close: get("close") as HTMLButtonElement,
        backdrop: get("backdrop"),
        prev: get("prev") as HTMLButtonElement,
        next: get("next") as HTMLButtonElement,
      },
      hooks: { onOpen, onClose, sourceRect: () => null },
    }).mount();

    theater.open({});
    expect(get("theater").classList.contains("is-open")).toBe(true);
    expect(get("counter").textContent).toBe("01 / 01");
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(document.documentElement.classList.contains("is-theater-open")).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(get("theater").classList.contains("is-open")).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    theater.destroy();
  });
});

describe("TheaterLauncher", () => {
  it("launches on click and on keyboard activation", () => {
    setBody('<div data-js="frame" role="button"><span data-js="dwell"></span></div>');
    const root = document.querySelector<HTMLElement>("[data-js=frame]");
    const label = document.querySelector<HTMLElement>("[data-js=dwell]");
    if (!root || !label) throw new Error("missing fixtures");
    const onLaunch = vi.fn();

    const launcher = new TheaterLauncher(root, { label, onLaunch, i18n }).mount();
    root.click();
    expect(onLaunch).toHaveBeenCalledTimes(1);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(onLaunch).toHaveBeenCalledTimes(2);
    expect(launcher.screenRect.width).toBeGreaterThanOrEqual(0);
    launcher.destroy();
  });
});
