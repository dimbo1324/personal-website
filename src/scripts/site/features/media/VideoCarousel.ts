import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import { whenPageIdle } from "../../core/idle";
import { motion } from "../../core/motion";
import { ticker } from "../../core/ticker";
import type { ViewportObserver } from "../../core/viewport";
import type { I18nService } from "../../i18n/service";
import type { LocalizedText } from "../../i18n/types";
import type { VideoClip } from "./catalog/VideoClip";

interface CarouselElements {
  readonly fallback: HTMLImageElement;
  readonly iris: HTMLElement;
  readonly segments: HTMLElement;
  readonly title: HTMLElement;
  readonly counter: HTMLElement;
  readonly concept: HTMLElement | null;
}

interface VideoCarouselOptions extends CarouselElements {
  readonly videos: readonly HTMLVideoElement[];
  readonly i18n: I18nService;
  readonly compact?: boolean;
  readonly viewport: ViewportObserver;
}

interface FallbackInfo {
  readonly title: string | LocalizedText;
}

/** Hero reel: plays any number of clips back to back with an "iris" transition. */
export class VideoCarousel extends Component<HTMLElement> {
  static readonly LEAD_S = 0.95;
  static readonly TRANSITION_MS = 1100;
  static readonly PREPARE_NEXT_AT_S = 3;

  readonly #videos: [HTMLVideoElement, HTMLVideoElement];
  readonly #el: CarouselElements;
  readonly #i18n: I18nService;
  readonly #compact: boolean;
  readonly #viewport: ViewportObserver;
  #clips: VideoClip[] = [];
  #fallback: FallbackInfo | null = null;
  #index = 0;
  #active = 0;
  #segments: HTMLElement[] = [];
  #removeTick: (() => void) | null = null;
  #visible = false;
  #suspended = false;
  #swapping = false;
  #ready = false;
  #nextPrepared = false;

  constructor(
    root: HTMLElement,
    {
      videos,
      fallback,
      iris,
      segments,
      title,
      counter,
      concept = null,
      i18n,
      compact = false,
      viewport,
    }: VideoCarouselOptions,
  ) {
    super(root);
    const first = videos[0];
    const second = videos[1];
    if (!first || !second || videos.length !== 2)
      throw new Error("VideoCarousel needs exactly two <video> elements");
    this.#videos = [first, second];
    this.#el = { fallback, iris, segments, title, counter, concept };
    this.#i18n = i18n;
    this.#compact = compact;
    this.#viewport = viewport;
  }

  override mount(): this {
    for (const video of this.#videos) {
      video.muted = true;
      video.playsInline = true;
    }
    this.own(
      this.#viewport.watch(this.root, (entry) => {
        this.#visible = entry.isIntersecting;
        this.#sync();
      }),
    );
    this.on(document, "visibilitychange", () => this.#sync());
    this.own(this.#i18n.subscribe(() => this.#renderMeta(), { immediate: false }));
    this.#el.title.textContent = this.#i18n.t("reel.loading");
    return super.mount();
  }

  protected override onDestroy(): void {
    this.#stopTicking();
    for (const video of this.#videos) video.pause();
  }

  setClips(clips: readonly VideoClip[], fallback: FallbackInfo): void {
    this.#clips = [...clips];
    this.#fallback = fallback;
    const first = this.#clips[0];
    if (this.#clips.length === 0) {
      this.root.classList.add("is-empty");
      for (const video of this.#videos) video.hidden = true;
      this.#el.fallback.hidden = false;
      this.#renderMeta();
      return;
    }

    this.#buildSegments();
    this.#index = 0;
    if (first) {
      this.#setPoster(this.#current, first);
    }
    this.#current.classList.add("is-active");
    this.#renderMeta();

    void whenPageIdle().then(() => {
      if (this.signal.aborted) return;
      this.#ready = true;
      if (first) this.#load(this.#current, first);
      this.#sync();
    });
  }

  get clips(): readonly VideoClip[] {
    return this.#clips;
  }

  get index(): number {
    return this.#index;
  }

  /** The element currently on screen (for handing playback to theater mode). */
  get activeVideo(): HTMLVideoElement | null {
    return this.#clips.length ? this.#current : null;
  }

  suspend(): void {
    this.#suspended = true;
    this.#sync();
  }

  resume(): void {
    this.#suspended = false;
    this.#sync();
  }

  get #current(): HTMLVideoElement {
    return this.#videos[this.#active] ?? this.#videos[0];
  }

  get #idle(): HTMLVideoElement {
    return this.#videos[1 - this.#active] ?? this.#videos[1];
  }

  get #nextIndex(): number {
    return (this.#index + 1) % this.#clips.length;
  }

  #setPoster(video: HTMLVideoElement, clip: VideoClip): void {
    if (clip.poster) video.poster = clip.poster;
    else video.removeAttribute("poster");
  }

  #load(video: HTMLVideoElement, clip: VideoClip): void {
    const source = clip.sourceFor({ compact: this.#compact });
    this.#setPoster(video, clip);
    video.preload = "auto";
    if (video.dataset.src !== source) {
      video.dataset.src = source;
      video.src = source;
    }
  }

  #prepareNext(): void {
    this.#nextPrepared = true;
    const idle = this.#idle;
    const clip = this.#clips[this.#nextIndex];
    if (clip) this.#load(idle, clip);
    idle.pause();
    try {
      idle.currentTime = 0;
    } catch {
      // Metadata not loaded yet.
    }
  }

  #sync(): void {
    if (!this.#clips.length || !this.#ready) return;
    const shouldPlay = this.#visible && !document.hidden && !this.#suspended;
    if (shouldPlay) {
      this.#current.play().catch(() => undefined);
      this.#startTicking();
    } else {
      for (const video of this.#videos) video.pause();
      this.#stopTicking();
    }
  }

  #startTicking(): void {
    if (!this.#removeTick) this.#removeTick = ticker.add(() => this.#tick());
  }

  #stopTicking(): void {
    this.#removeTick?.();
    this.#removeTick = null;
  }

  #tick(): void {
    const video = this.#current;
    if (!Number.isFinite(video.duration) || video.duration === 0) return;
    this.#renderProgress(video.currentTime / video.duration);
    if (
      !this.#nextPrepared &&
      video.currentTime >= Math.min(VideoCarousel.PREPARE_NEXT_AT_S, video.duration / 2)
    ) {
      this.#prepareNext();
    }
    if (
      this.#nextPrepared &&
      !this.#swapping &&
      video.duration - video.currentTime <= VideoCarousel.LEAD_S
    ) {
      this.#advance();
    }
  }

  #advance(): void {
    this.#swapping = true;
    const outgoing = this.#current;
    const incoming = this.#idle;

    incoming.currentTime = 0;
    incoming.play().catch(() => undefined);
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
      this.#nextPrepared = false;
      this.#swapping = false;
    }, VideoCarousel.TRANSITION_MS + 60);
  }

  #playTransition(incoming: HTMLVideoElement, outgoing: HTMLVideoElement): void {
    if (motion.reduced) return;
    const duration = VideoCarousel.TRANSITION_MS;
    const easing = "cubic-bezier(0.65, 0, 0.35, 1)";

    incoming.animate(
      [
        {
          clipPath: "circle(0% at 50% 52%)",
          transform: "scale(1)",
          filter: "blur(14px) brightness(1.7) saturate(1.4)",
        },
        {
          clipPath: "circle(38% at 50% 52%)",
          filter: "blur(4px) brightness(1.25) saturate(1.15)",
          offset: 0.55,
        },
        {
          clipPath: "circle(75% at 50% 52%)",
          transform: "scale(1)",
          filter: "blur(0) brightness(1) saturate(1)",
        },
      ],
      { duration, easing },
    );
    outgoing
      .animate(
        [
          { transform: "scale(1)", filter: "brightness(1)" },
          { transform: "scale(1.07)", filter: "brightness(0.45)" },
        ],
        { duration, easing, fill: "forwards" },
      )
      .finished.then(
        (animation) => animation.cancel(),
        () => undefined,
      );
    this.#el.iris.animate(
      [
        { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
        { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0 },
      ],
      { duration, easing },
    );
  }

  #buildSegments(): void {
    this.#el.segments.replaceChildren();
    this.#segments = this.#clips.map(() => {
      const fill = createElement("span", { className: "media-frame__segment-fill" });
      this.#el.segments.append(
        createElement("span", { className: "media-frame__segment", children: [fill] }),
      );
      return fill;
    });
    this.#el.segments.hidden = this.#clips.length < 2;
  }

  #renderProgress(progress: number): void {
    this.#segments.forEach((fill, index) => {
      const value = index < this.#index ? 1 : index === this.#index ? progress : 0;
      fill.style.transform = `scaleX(${value.toFixed(3)})`;
    });
  }

  #renderMeta(): void {
    const { title, counter, concept } = this.#el;
    if (!this.#clips.length) {
      title.textContent = this.#fallback
        ? this.#i18n.pick(this.#fallback.title)
        : this.#i18n.t("reel.loading");
      counter.textContent = "";
      if (concept) concept.hidden = true;
      return;
    }
    const clip = this.#clips[this.#index];
    if (!clip) return;
    title.textContent = clip.title(this.#i18n.lang);
    counter.textContent =
      this.#clips.length > 1
        ? `${String(this.#index + 1).padStart(2, "0")} / ${String(this.#clips.length).padStart(2, "0")}`
        : "";
    if (concept) concept.hidden = !clip.generated;
    this.#renderProgress(0);
  }
}
