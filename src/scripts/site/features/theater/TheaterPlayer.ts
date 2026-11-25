import { clamp01 } from "../../core/animation";
import type { I18nService } from "../../i18n/service";
import { formatTime } from "./formatTime";

interface TheaterPlayerElements {
  readonly controls: HTMLElement;
  readonly play: HTMLButtonElement;
  readonly playIcon: SVGUseElement;
  readonly progress: HTMLElement;
  readonly fill: HTMLElement;
  readonly time: HTMLElement;
}

/** Minimal custom video controls with scrubbing and keyboard seeking. */
export class TheaterPlayer {
  static readonly ICONS = Object.freeze({
    play: "/assets/icons/sprite.svg#i-play",
    pause: "/assets/icons/sprite.svg#i-pause",
  });
  static readonly KEY_STEP_S = 1;

  readonly #video: HTMLVideoElement;
  readonly #el: TheaterPlayerElements;
  readonly #controller = new AbortController();
  readonly #i18n: I18nService;

  constructor(video: HTMLVideoElement, elements: TheaterPlayerElements, i18n: I18nService) {
    this.#video = video;
    this.#el = elements;
    this.#i18n = i18n;
  }

  get video(): HTMLVideoElement {
    return this.#video;
  }

  attach(): this {
    const { signal } = this.#controller;
    const video = this.#video;
    video.muted = true;

    this.#el.play.addEventListener("click", () => this.toggle(), { signal });
    for (const type of ["play", "pause"] as const) {
      video.addEventListener(type, () => this.#renderState(), { signal });
    }
    for (const type of ["timeupdate", "loadedmetadata", "seeked"] as const) {
      video.addEventListener(type, () => this.#renderTime(), { signal });
    }

    this.#el.progress.addEventListener("pointerdown", (event) => this.#startScrub(event), {
      signal,
    });
    this.#el.progress.addEventListener("keydown", (event) => this.#onKey(event), { signal });
    const unsubscribe = this.#i18n.subscribe(() => this.#renderState());
    signal.addEventListener("abort", unsubscribe, { once: true });
    return this;
  }

  destroy(): void {
    this.#controller.abort();
  }

  /** Switch the source (no-op if already loaded); the poster shows until the first frame. */
  load(src: string, poster: string | null = null): void {
    this.#video.preload = "auto";
    if (poster) this.#video.poster = poster;
    else this.#video.removeAttribute("poster");
    if (this.#video.dataset.src !== src) {
      this.#video.dataset.src = src;
      this.#video.src = src;
    }
  }

  seek(time: number): void {
    const apply = (): void => {
      try {
        this.#video.currentTime = time;
      } catch {
        // Not seekable yet.
      }
    };
    if (this.#video.readyState >= 1) apply();
    else this.#video.addEventListener("loadedmetadata", apply, { once: true });
  }

  onEnded(callback: () => void): void {
    this.#video.addEventListener("ended", callback, { signal: this.#controller.signal });
  }

  play(): void {
    if (this.#video.preload !== "auto") this.#video.preload = "auto";
    this.#video.play().catch(() => undefined);
  }

  pause(): void {
    this.#video.pause();
  }

  toggle(): void {
    if (this.#video.paused) this.play();
    else this.pause();
  }

  setVisible(visible: boolean): void {
    this.#el.controls.hidden = !visible;
  }

  #renderState(): void {
    const playing = !this.#video.paused;
    this.#el.playIcon.setAttribute(
      "href",
      playing ? TheaterPlayer.ICONS.pause : TheaterPlayer.ICONS.play,
    );
    this.#el.play.setAttribute(
      "aria-label",
      this.#i18n.t(playing ? "theater.pause" : "theater.play"),
    );
  }

  #renderTime(): void {
    const { currentTime, duration } = this.#video;
    const ratio = duration ? clamp01(currentTime / duration) : 0;
    this.#el.fill.style.width = `${(ratio * 100).toFixed(2)}%`;
    this.#el.progress.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    this.#el.time.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  }

  #seekToClientX(clientX: number): void {
    const rect = this.#el.progress.getBoundingClientRect();
    const ratio = clamp01((clientX - rect.left) / rect.width);
    if (this.#video.duration) this.#video.currentTime = ratio * this.#video.duration;
  }

  #startScrub(event: PointerEvent): void {
    event.preventDefault();
    const bar = this.#el.progress;
    bar.setPointerCapture(event.pointerId);
    this.#seekToClientX(event.clientX);
    const move = (moveEvent: PointerEvent): void => this.#seekToClientX(moveEvent.clientX);
    const end = (): void => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", end);
      bar.removeEventListener("pointercancel", end);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
  }

  #onKey(event: KeyboardEvent): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    const delta = event.key === "ArrowRight" ? TheaterPlayer.KEY_STEP_S : -TheaterPlayer.KEY_STEP_S;
    this.#video.currentTime = Math.max(
      0,
      Math.min(this.#video.duration || 0, this.#video.currentTime + delta),
    );
  }
}
