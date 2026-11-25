import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import { createIcon } from "../../core/icons";
import { motion } from "../../core/motion";
import { lockScroll, unlockScroll } from "../../core/scroll-lock";
import type { I18nService } from "../../i18n/service";
import { grabFrame } from "../media/frameGrabber";
import { flipFromRect } from "./flipAnimation";
import type { TheaterPlaylist } from "./TheaterPlaylist";
import type { TheaterPlayer } from "./TheaterPlayer";

interface TheaterElements {
  readonly stage: HTMLElement;
  readonly image: HTMLImageElement;
  readonly counter: HTMLElement;
  readonly close: HTMLButtonElement;
  readonly backdrop: HTMLElement;
  readonly prev: HTMLButtonElement;
  readonly next: HTMLButtonElement;
  readonly title: HTMLElement;
  readonly caption: HTMLElement;
  readonly rail: HTMLElement;
  readonly concept: HTMLElement | null;
}

interface TheaterHooks {
  readonly onOpen?: () => void;
  readonly onClose?: () => void;
  readonly sourceRect?: () => DOMRect | null;
}

interface TheaterOptions {
  readonly elements: TheaterElements;
  readonly playlist: TheaterPlaylist;
  readonly player: TheaterPlayer;
  readonly background: readonly HTMLElement[];
  readonly i18n: I18nService;
  readonly hooks?: TheaterHooks;
}

interface OpenOptions {
  readonly from?: DOMRect | null;
  readonly index?: number;
  readonly time?: number;
}

/** Theater mode: the hero frame grows into a full playlist viewer. */
export class Theater extends Component<HTMLElement> {
  static readonly OPEN_MS = 760;
  static readonly CLOSE_MS = 560;

  readonly #el: TheaterElements;
  readonly #playlist: TheaterPlaylist;
  readonly #player: TheaterPlayer;
  readonly #background: readonly HTMLElement[];
  readonly #hooks: TheaterHooks;
  readonly #i18n: I18nService;
  readonly #thumbs: HTMLButtonElement[] = [];
  #open = false;
  #returnFocus: Element | null = null;
  #sourceRect: DOMRect | null = null;
  #thumbsRequested = false;

  constructor(
    root: HTMLElement,
    { elements, playlist, player, background, i18n, hooks = {} }: TheaterOptions,
  ) {
    super(root);
    this.#i18n = i18n;
    this.#el = elements;
    this.#playlist = playlist;
    this.#player = player;
    this.#background = background;
    this.#hooks = hooks;
  }

  get isOpen(): boolean {
    return this.#open;
  }

  override mount(): this {
    this.#player.attach();
    this.#player.onEnded(() => this.#onClipEnded());
    this.#buildRail();

    const { close, backdrop, prev, next } = this.#el;
    this.on(close, "click", () => this.close());
    this.on(backdrop, "click", () => this.close());
    this.on(prev, "click", () => this.select(this.#playlist.index - 1));
    this.on(next, "click", () => this.select(this.#playlist.index + 1));
    this.on(document, "keydown", (event) => this.#onKey(event));

    this.root.inert = true;
    this.own(this.#i18n.subscribe(() => this.#renderTexts(), { immediate: false }));
    this.#renderTexts();
    return super.mount();
  }

  protected override onDestroy(): void {
    this.#player.destroy();
  }

  open({ from = null, index = 0, time = 0 }: OpenOptions = {}): void {
    if (this.#open) return;
    this.#open = true;
    this.#returnFocus = document.activeElement;
    this.#sourceRect = from;

    const html = document.documentElement;
    html.style.setProperty("--theater-origin-y", `${window.scrollY + window.innerHeight / 2}px`);
    html.classList.add("is-theater-open");
    for (const element of this.#background) element.inert = true;
    lockScroll();

    this.root.inert = false;
    this.root.setAttribute("aria-hidden", "false");
    this.root.classList.add("is-open");
    this.root.scrollTop = 0;

    this.select(index);
    if (this.#playlist.current?.type === "video" && time > 0) this.#player.seek(time);
    void this.#requestThumbs();
    this.#hooks.onOpen?.();

    if (from && !motion.reduced) flipFromRect(this.#el.stage, from, { duration: Theater.OPEN_MS });
    this.#el.close.focus({ preventScroll: true });
  }

  close(): void {
    if (!this.#open) return;
    this.#open = false;
    this.#player.pause();

    const target = this.#sourceRect ?? this.#hooks.sourceRect?.() ?? null;
    const finish = (): void => this.#finishClose();

    if (target && !motion.reduced && this.#playlist.current?.type === "video") {
      const animation = flipFromRect(this.#el.stage, target, {
        duration: Theater.CLOSE_MS,
        reverse: true,
      });
      this.root.classList.remove("is-open");
      animation.finished.then(
        () => {
          finish();
          animation.cancel();
        },
        () => finish(),
      );
    } else {
      this.root.classList.remove("is-open");
      finish();
    }

    document.documentElement.classList.remove("is-theater-open");
  }

  /** Show playlist item `index` on the stage. */
  select(index: number): void {
    const item = this.#playlist.select(index);
    if (!item) return;
    const video = this.#player.video;
    const { image, counter } = this.#el;

    this.#renderCaption();
    counter.textContent = `${String(this.#playlist.index + 1).padStart(2, "0")} / ${String(this.#playlist.length).padStart(2, "0")}`;

    if (item.type === "video") {
      image.hidden = true;
      video.hidden = false;
      this.#player.load(item.src, item.poster);
      this.#player.setVisible(true);
      if (this.#open) this.#player.play();
    } else {
      this.#player.pause();
      video.hidden = true;
      this.#player.setVisible(false);
      image.hidden = false;
      image.src = item.src;
      image.style.animation = "none";
      void image.offsetWidth;
      image.style.removeProperty("animation");
    }

    this.#thumbs.forEach((thumb, position) => {
      const active = position === this.#playlist.index;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-current", String(active));
      if (active && this.#open) {
        thumb.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: motion.reduced ? "auto" : "smooth",
        });
      }
    });
  }

  #renderCaption(): void {
    const item = this.#playlist.current;
    if (!item) return;
    const title = this.#i18n.pick(item.title);
    this.#el.title.textContent = title;
    this.#el.caption.textContent = this.#i18n.pick(item.description);
    if (item.type === "image") this.#el.image.alt = title;
    if (this.#el.concept) this.#el.concept.hidden = !item.generated;
  }

  #renderTexts(): void {
    this.#renderCaption();
    this.#thumbs.forEach((thumb, index) => {
      const item = this.#playlist.items[index];
      if (!item) return;
      const title = this.#i18n.pick(item.title);
      thumb.setAttribute("aria-label", this.#i18n.t("theater.show", { title }));
      const label = thumb.querySelector(".theater-thumb__label");
      if (label) label.textContent = title;
    });
  }

  #finishClose(): void {
    this.root.setAttribute("aria-hidden", "true");
    this.root.inert = true;
    for (const element of this.#background) element.inert = false;
    unlockScroll();
    this.#hooks.onClose?.();
    if (this.#returnFocus instanceof HTMLElement) this.#returnFocus.focus({ preventScroll: true });
  }

  #onClipEnded(): void {
    const next = this.#playlist.nextVideoIndex;
    if (next >= 0) this.select(next);
  }

  async #requestThumbs(): Promise<void> {
    if (this.#thumbsRequested) return;
    this.#thumbsRequested = true;
    for (const [index, item] of this.#playlist.items.entries()) {
      if (item.type !== "video" || item.thumb) continue;
      const url = await grabFrame(item.src);
      if (!url) continue;
      this.#playlist.setThumb(index, url);
      const image = this.#thumbs[index]?.querySelector("img");
      if (image) {
        image.src = url;
        this.#thumbs[index]?.classList.remove("is-pending");
      }
    }
  }

  #buildRail(): void {
    this.#playlist.items.forEach((item, index) => {
      const imageAttrs: Record<string, string> = { alt: "", loading: "lazy", decoding: "async" };
      if (item.thumb) imageAttrs.src = item.thumb;
      const image = createElement("img", { attrs: imageAttrs });
      const label = createElement("span", { className: "theater-thumb__label" });
      const children: Element[] = [image, label];
      if (item.type === "video") {
        children.push(
          createElement("span", {
            className: "theater-thumb__badge",
            children: [createIcon("play", "sm")],
          }),
        );
      }
      const thumb = createElement("button", {
        className: item.thumb ? "theater-thumb" : "theater-thumb is-pending",
        attrs: { type: "button" },
        children,
      });
      this.on(thumb, "click", () => this.select(index));
      this.on(image, "error", () => thumb.classList.add("is-fallback"), { once: true });
      this.#el.rail.append(createElement("li", { children: [thumb] }));
      this.#thumbs.push(thumb);
    });
  }

  #onKey(event: KeyboardEvent): void {
    if (!this.#open) return;
    if (event.key === "Escape") this.close();
    if (event.key === "ArrowRight") this.select(this.#playlist.index + 1);
    if (event.key === "ArrowLeft") this.select(this.#playlist.index - 1);
  }
}
