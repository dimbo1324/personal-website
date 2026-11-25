import { Component } from "../../core/component";
import { motion } from "../../core/motion";
import type { ViewportObserver } from "../../core/viewport";

interface FlagBackdropOptions {
  readonly video: HTMLVideoElement;
  readonly observeTarget: HTMLElement;
  readonly viewport: ViewportObserver;
}

/** Full-bleed Uruguay flag behind the footer. */
export class FlagBackdrop extends Component<HTMLElement> {
  readonly #video: HTMLVideoElement;
  readonly #viewport: ViewportObserver;
  readonly #observeTarget: HTMLElement;
  #revealed = false;

  constructor(root: HTMLElement, { video, observeTarget, viewport }: FlagBackdropOptions) {
    super(root);
    this.#video = video;
    this.#observeTarget = observeTarget;
    this.#viewport = viewport;
  }

  override mount(): this {
    this.#video.muted = true;
    this.on(this.#video, "playing", () => this.root.classList.add("is-playing"));
    this.own(
      this.#viewport.watch(this.#observeTarget, (entry) => {
        this.#onVisibility(entry.isIntersecting);
      }),
    );
    this.on(document, "visibilitychange", () => {
      if (document.hidden) this.#video.pause();
    });
    return super.mount();
  }

  protected override onDestroy(): void {
    this.#video.pause();
  }

  #onVisibility(visible: boolean): void {
    if (visible && !this.#revealed) {
      this.#revealed = true;
      this.root.classList.add("is-revealed");
    }
    if (motion.reduced) return;

    if (visible) {
      if (this.#video.preload !== "auto") this.#video.preload = "auto";
      this.#video.play().catch(() => {
        // Autoplay refused — the still image stays visible.
      });
    } else {
      this.#video.pause();
    }
  }
}
