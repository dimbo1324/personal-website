import { formatTime } from "./formatTime.js";
import { clamp01 } from "../../core/math.js";

/**
 * Minimal custom video controls: play/pause, progress with click/drag
 * seeking and keyboard seeking (← → on the slider), time readout.
 */
export class TheaterPlayer {
  static ICONS = Object.freeze({ play: "assets/icons/sprite.svg#i-play", pause: "assets/icons/sprite.svg#i-pause" });
  static KEY_STEP_S = 1;

  #video;
  #el;
  #controller = new AbortController();
  #i18n;

  /**
   * @param {HTMLVideoElement} video
   * @param {{ controls: HTMLElement, play: HTMLButtonElement, playIcon: SVGUseElement,
   *           progress: HTMLElement, fill: HTMLElement, time: HTMLElement }} elements
   * @param {import("../../i18n/I18nService.js").I18nService} i18n
   */
  constructor(video, elements, i18n) {
    this.#video = video;
    this.#el = elements;
    this.#i18n = i18n;
  }

  get video() {
    return this.#video;
  }

  attach() {
    const { signal } = this.#controller;
    const video = this.#video;
    video.muted = true;

    this.#el.play.addEventListener("click", () => this.toggle(), { signal });
    ["play", "pause"].forEach((type) => video.addEventListener(type, () => this.#renderState(), { signal }));
    ["timeupdate", "loadedmetadata", "seeked"].forEach((type) =>
      video.addEventListener(type, () => this.#renderTime(), { signal }),
    );

    this.#el.progress.addEventListener("pointerdown", (event) => this.#startScrub(event), { signal });
    this.#el.progress.addEventListener("keydown", (event) => this.#onKey(event), { signal });
    const unsubscribe = this.#i18n.subscribe(() => this.#renderState());
    signal.addEventListener("abort", unsubscribe, { once: true });
    return this;
  }

  destroy() {
    this.#controller.abort();
  }

  /** Switch the source (no-op if already loaded); the poster shows until the first frame. */
  load(src, poster = null) {
    this.#video.preload = "auto";
    if (poster) this.#video.poster = poster;
    else this.#video.removeAttribute("poster");
    if (this.#video.dataset.src !== src) {
      this.#video.dataset.src = src;
      this.#video.src = src;
    }
  }

  /** Seek once metadata is available. */
  seek(time) {
    const apply = () => {
      try {
        this.#video.currentTime = time;
      } catch {
        /* not seekable yet */
      }
    };
    if (this.#video.readyState >= 1) apply();
    else this.#video.addEventListener("loadedmetadata", apply, { once: true });
  }

  /** @param {() => void} callback fired when a clip ends */
  onEnded(callback) {
    this.#video.addEventListener("ended", callback, { signal: this.#controller.signal });
  }

  play() {
    if (this.#video.preload !== "auto") this.#video.preload = "auto";
    return this.#video.play().catch(() => {});
  }

  pause() {
    this.#video.pause();
  }

  toggle() {
    if (this.#video.paused) this.play();
    else this.pause();
  }

  setVisible(visible) {
    this.#el.controls.hidden = !visible;
  }

  #renderState() {
    const playing = !this.#video.paused;
    this.#el.playIcon.setAttribute("href", playing ? TheaterPlayer.ICONS.pause : TheaterPlayer.ICONS.play);
    this.#el.play.setAttribute("aria-label", this.#i18n.t(playing ? "theater.pause" : "theater.play"));
  }

  #renderTime() {
    const { currentTime, duration } = this.#video;
    const ratio = duration ? clamp01(currentTime / duration) : 0;
    this.#el.fill.style.width = `${(ratio * 100).toFixed(2)}%`;
    this.#el.progress.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    this.#el.time.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  }

  #seekToClientX(clientX) {
    const rect = this.#el.progress.getBoundingClientRect();
    const ratio = clamp01((clientX - rect.left) / rect.width);
    if (this.#video.duration) this.#video.currentTime = ratio * this.#video.duration;
  }

  #startScrub(event) {
    event.preventDefault();
    const bar = this.#el.progress;
    bar.setPointerCapture(event.pointerId);
    this.#seekToClientX(event.clientX);
    const move = (moveEvent) => this.#seekToClientX(moveEvent.clientX);
    const end = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", end);
      bar.removeEventListener("pointercancel", end);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
  }

  #onKey(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation(); // don't switch playlist items while seeking
    const delta = event.key === "ArrowRight" ? TheaterPlayer.KEY_STEP_S : -TheaterPlayer.KEY_STEP_S;
    this.#video.currentTime = Math.max(0, Math.min(this.#video.duration || 0, this.#video.currentTime + delta));
  }
}
