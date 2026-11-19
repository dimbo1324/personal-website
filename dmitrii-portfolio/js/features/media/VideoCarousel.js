import { Component } from "../../core/Component.js";
import { ticker } from "../../core/Ticker.js";
import { motion } from "../../core/MotionPreference.js";
import { createElement } from "../../core/dom.js";

/**
 * Hero reel: plays any number of clips back to back with an "iris" transition.
 *
 * Two <video> elements alternate: while one plays, the other preloads the
 * next clip; LEAD_S before the end the idle one starts and is revealed
 * through an expanding circle (blur → sharp, slight zoom), the outgoing one
 * drifts back and dims, and a light ring rides the iris edge.
 * One clip → it loops with the same transition. No clips → a still image.
 * Playback pauses off-screen, in hidden tabs and while theater mode is open.
 */
export class VideoCarousel extends Component {
  static LEAD_S = 0.95;
  static TRANSITION_MS = 1100;

  #videos;
  #el;
  #clips = [];
  #index = 0;
  #active = 0;
  #segments = [];
  #removeTick = null;
  #visible = false;
  #suspended = false;
  #swapping = false;

  /**
   * @param {HTMLElement} root  the media frame
   * @param {{ videos: HTMLVideoElement[], fallback: HTMLImageElement, iris: HTMLElement, segments: HTMLElement,
   *           title: HTMLElement, counter: HTMLElement,
   *           viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { videos, fallback, iris, segments, title, counter, viewport }) {
    super(root);
    if (videos.length !== 2) throw new Error("VideoCarousel needs exactly two <video> elements");
    this.#videos = videos;
    this.#el = { fallback, iris, segments, title, counter };
    this.viewport = viewport;
  }

  mount() {
    this.#videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
    });
    this.own(
      this.viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#sync();
      }),
    );
    this.on(document, "visibilitychange", () => this.#sync());
    return super.mount();
  }

  onDestroy() {
    this.#stopTicking();
    this.#videos.forEach((video) => video.pause());
  }

  /**
   * @param {import("./catalog/VideoClip.js").VideoClip[]} clips
   * @param {{ title: string }} fallback
   */
  setClips(clips, fallback) {
    this.#clips = clips;
    if (clips.length === 0) {
      this.root.classList.add("is-empty");
      this.#videos.forEach((video) => {
        video.hidden = true;
      });
      this.#el.fallback.hidden = false;
      this.#el.title.textContent = fallback.title;
      this.#el.counter.textContent = "";
      return;
    }

    this.#buildSegments();
    this.#index = 0;
    this.#load(this.#current, clips[0]);
    this.#current.classList.add("is-active");
    this.#prepareNext();
    this.#renderMeta();
    this.#sync();
  }

  get clips() {
    return this.#clips;
  }

  get index() {
    return this.#index;
  }

  /** The element currently on screen (for handing playback to theater mode). */
  get activeVideo() {
    return this.#clips.length ? this.#current : null;
  }

  suspend() {
    this.#suspended = true;
    this.#sync();
  }

  resume() {
    this.#suspended = false;
    this.#sync();
  }

  get #current() {
    return this.#videos[this.#active];
  }

  get #idle() {
    return this.#videos[1 - this.#active];
  }

  get #nextIndex() {
    return (this.#index + 1) % this.#clips.length;
  }

  #load(video, clip) {
    video.preload = "auto";
    if (video.dataset.src !== clip.src) {
      video.dataset.src = clip.src;
      video.src = clip.src;
    }
  }

  /** The idle element buffers the next clip so the switch never shows black. */
  #prepareNext() {
    const idle = this.#idle;
    this.#load(idle, this.#clips[this.#nextIndex]);
    idle.pause();
    try {
      idle.currentTime = 0;
    } catch {
      /* metadata not loaded yet */
    }
  }

  #sync() {
    if (!this.#clips.length) return;
    const shouldPlay = this.#visible && !document.hidden && !this.#suspended;
    if (shouldPlay) {
      this.#current.play().catch(() => {});
      this.#startTicking();
    } else {
      this.#videos.forEach((video) => video.pause());
      this.#stopTicking();
    }
  }

  #startTicking() {
    if (!this.#removeTick) this.#removeTick = ticker.add(() => this.#tick());
  }

  #stopTicking() {
    this.#removeTick?.();
    this.#removeTick = null;
  }

  #tick() {
    const video = this.#current;
    if (!Number.isFinite(video.duration) || video.duration === 0) return;
    this.#renderProgress(video.currentTime / video.duration);
    if (!this.#swapping && video.duration - video.currentTime <= VideoCarousel.LEAD_S) this.#advance();
  }

  #advance() {
    this.#swapping = true;
    const outgoing = this.#current;
    const incoming = this.#idle;

    incoming.currentTime = 0;
    incoming.play().catch(() => {});
    outgoing.classList.remove("is-active");
    outgoing.classList.add("is-leaving");
    incoming.classList.add("is-active");
    this.#playTransition(incoming, outgoing);

    this.#active = 1 - this.#active;
    this.#index = this.#nextIndex;
    this.#renderMeta();

    window.setTimeout(() => {
      outgoing.pause();
      outgoing.classList.remove("is-leaving");
      this.#prepareNext();
      this.#swapping = false;
    }, VideoCarousel.TRANSITION_MS + 60);
  }

  #playTransition(incoming, outgoing) {
    if (motion.reduced) return;
    const duration = VideoCarousel.TRANSITION_MS;
    const easing = "cubic-bezier(0.65, 0, 0.35, 1)";

    incoming.animate(
      [
        { clipPath: "circle(0% at 50% 52%)", transform: "scale(1.18)", filter: "blur(14px) brightness(1.7) saturate(1.4)" },
        { clipPath: "circle(38% at 50% 52%)", filter: "blur(4px) brightness(1.25) saturate(1.15)", offset: 0.55 },
        { clipPath: "circle(75% at 50% 52%)", transform: "scale(1)", filter: "blur(0) brightness(1) saturate(1)" },
      ],
      { duration, easing },
    );
    outgoing.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.07)", filter: "brightness(0.45)" },
      ],
      { duration, easing, fill: "forwards" },
    ).finished.then((animation) => animation.cancel(), () => {});
    this.#el.iris.animate(
      [
        { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
        { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0 },
      ],
      { duration, easing },
    );
  }

  #buildSegments() {
    this.#el.segments.replaceChildren();
    this.#segments = this.#clips.map(() => {
      const fill = createElement("span", { className: "media-frame__segment-fill" });
      this.#el.segments.append(createElement("span", { className: "media-frame__segment", children: [fill] }));
      return fill;
    });
    this.#el.segments.hidden = this.#clips.length < 2;
  }

  #renderProgress(progress) {
    this.#segments.forEach((fill, i) => {
      const value = i < this.#index ? 1 : i === this.#index ? progress : 0;
      fill.style.transform = `scaleX(${value.toFixed(3)})`;
    });
  }

  #renderMeta() {
    const clip = this.#clips[this.#index];
    this.#el.title.textContent = clip.title;
    this.#el.counter.textContent =
      this.#clips.length > 1 ? `${String(this.#index + 1).padStart(2, "0")} / ${String(this.#clips.length).padStart(2, "0")}` : "";
    this.#renderProgress(0);
  }
}
