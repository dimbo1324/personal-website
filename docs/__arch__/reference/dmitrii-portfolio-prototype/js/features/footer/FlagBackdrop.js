import { Component } from "../../core/Component.js";
import { motion } from "../../core/MotionPreference.js";

/**
 * Full-bleed Uruguay flag behind the footer.
 * - unveils (clip-path wipe) the first time the footer enters the viewport;
 * - the seamless loop video is fetched lazily and only plays while visible;
 * - with reduced motion only the high-resolution still is shown.
 */
export class FlagBackdrop extends Component {
  #video;
  #revealed = false;

  /**
   * @param {HTMLElement} root  .flag-backdrop
   * @param {{ video: HTMLVideoElement, observeTarget: HTMLElement,
   *           viewport: import("../../core/ViewportObserver.js").ViewportObserver }} options
   */
  constructor(root, { video, observeTarget, viewport }) {
    super(root);
    this.#video = video;
    this.observeTarget = observeTarget;
    this.viewport = viewport;
  }

  mount() {
    this.#video.muted = true;
    this.on(this.#video, "playing", () => this.root.classList.add("is-playing"));
    this.own(this.viewport.watch(this.observeTarget, (entry) => this.#onVisibility(entry.isIntersecting)));
    this.on(document, "visibilitychange", () => {
      if (document.hidden) this.#video.pause();
    });
    return super.mount();
  }

  onDestroy() {
    this.#video.pause();
  }

  #onVisibility(visible) {
    if (visible && !this.#revealed) {
      this.#revealed = true;
      this.root.classList.add("is-revealed");
    }
    if (motion.reduced) return;

    if (visible) {
      if (this.#video.preload !== "auto") this.#video.preload = "auto";
      this.#video.play().catch(() => {
        /* autoplay refused — the still image stays visible */
      });
    } else {
      this.#video.pause();
    }
  }
}
