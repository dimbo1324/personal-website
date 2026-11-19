import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";
import { createIcon } from "../../core/icons.js";
import { lockScroll, unlockScroll } from "../../core/scrollLock.js";
import { motion } from "../../core/MotionPreference.js";
import { flipFromRect } from "./flipAnimation.js";
import { grabFrame } from "../media/frameGrabber.js";

/**
 * Theater mode: the keynote grows out of the hero frame (FLIP transition),
 * the page recedes (scaled, blurred, dimmed) and a playlist rail — the video
 * plus all gallery photos — runs underneath.
 * Keyboard: Esc closes, ← → browse. Focus is trapped by `inert` on the page
 * and restored on close.
 */
export class Theater extends Component {
  static OPEN_MS = 760;
  static CLOSE_MS = 560;

  #el;
  #playlist;
  #player;
  #thumbs = [];
  #open = false;
  #returnFocus = null;
  #sourceRect = null;
  #hooks;
  #thumbsRequested = false;

  /**
   * @param {HTMLElement} root
   * @param {{ elements: Record<string, HTMLElement>,
   *           playlist: import("./TheaterPlaylist.js").TheaterPlaylist,
   *           player: import("./TheaterPlayer.js").TheaterPlayer,
   *           background: HTMLElement[],
   *           hooks?: { onOpen?: () => void, onClose?: () => void, sourceRect?: () => DOMRect|null } }} options
   */
  constructor(root, { elements, playlist, player, background, hooks = {} }) {
    super(root);
    this.#el = elements;
    this.#playlist = playlist;
    this.#player = player;
    this.background = background;
    this.#hooks = hooks;
  }

  get isOpen() {
    return this.#open;
  }

  mount() {
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
    return super.mount();
  }

  onDestroy() {
    this.#player.destroy();
  }

  /**
   * @param {{ from?: DOMRect|null, index?: number, time?: number }} [options]
   *   index/time: continue the reel clip that was playing in the hero
   */
  open({ from = null, index = 0, time = 0 } = {}) {
    if (this.#open) return;
    this.#open = true;
    this.#returnFocus = document.activeElement;
    this.#sourceRect = from;

    const html = document.documentElement;
    html.style.setProperty("--theater-origin-y", `${window.scrollY + window.innerHeight / 2}px`);
    html.classList.add("is-theater-open");
    this.background.forEach((element) => {
      element.inert = true;
    });
    lockScroll();

    this.root.inert = false;
    this.root.setAttribute("aria-hidden", "false");
    this.root.classList.add("is-open");
    this.root.scrollTop = 0;

    this.select(index);
    if (this.#playlist.current.type === "video" && time > 0) this.#player.seek(time);
    this.#requestThumbs();
    this.#hooks.onOpen?.();

    if (from && !motion.reduced) flipFromRect(this.#el.stage, from, { duration: Theater.OPEN_MS });
    this.#el.close.focus({ preventScroll: true });
  }

  close() {
    if (!this.#open) return;
    this.#open = false;
    this.#player.pause();

    // the rect captured on open is exact: scrolling is locked while the theater
    // is up, and measuring now would catch the frame mid-scale with the page
    const target = this.#sourceRect ?? this.#hooks.sourceRect?.() ?? null;
    const finish = () => this.#finishClose();

    if (target && !motion.reduced && this.#playlist.current.type === "video") {
      const animation = flipFromRect(this.#el.stage, target, { duration: Theater.CLOSE_MS, reverse: true });
      this.root.classList.remove("is-open"); // backdrop & chrome fade while the stage flies back
      animation.finished.then(() => {
        finish();
        animation.cancel();
      }, finish);
    } else {
      this.root.classList.remove("is-open");
      finish();
    }

    document.documentElement.classList.remove("is-theater-open");
  }

  /** Show playlist item `index` on the stage. */
  select(index) {
    const item = this.#playlist.select(index);
    const { video } = this.#player;
    const { image, title, caption, counter } = this.#el;

    title.textContent = item.title;
    caption.textContent = item.description;
    counter.textContent = `${String(this.#playlist.index + 1).padStart(2, "0")} / ${String(this.#playlist.length).padStart(2, "0")}`;

    if (item.type === "video") {
      image.hidden = true;
      video.hidden = false;
      this.#player.load(item.src);
      this.#player.setVisible(true);
      if (this.#open) this.#player.play();
    } else {
      this.#player.pause();
      video.hidden = true;
      this.#player.setVisible(false);
      image.hidden = false;
      image.alt = item.title;
      image.src = item.src;
      // restart the fade-in animation for each photo
      image.style.animation = "none";
      void image.offsetWidth;
      image.style.removeProperty("animation");
    }

    this.#thumbs.forEach((thumb, i) => {
      const active = i === this.#playlist.index;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-current", String(active));
      if (active && this.#open) thumb.scrollIntoView({ block: "nearest", inline: "center", behavior: motion.reduced ? "auto" : "smooth" });
    });
  }

  #finishClose() {
    this.root.setAttribute("aria-hidden", "true");
    this.root.inert = true;
    this.background.forEach((element) => {
      element.inert = false;
    });
    unlockScroll();
    this.#hooks.onClose?.();
    this.#returnFocus?.focus?.({ preventScroll: true });
  }

  /** When a clip ends, roll on to the next clip in the playlist. */
  #onClipEnded() {
    const next = this.#playlist.nextVideoIndex;
    if (next >= 0) this.select(next);
  }

  /** Video thumbnails are captured from the clips themselves, once, lazily. */
  async #requestThumbs() {
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
        this.#thumbs[index].classList.remove("is-pending");
      }
    }
  }

  #buildRail() {
    this.#playlist.items.forEach((item, index) => {
      const imageAttrs = { alt: "", loading: "lazy", decoding: "async" };
      if (item.thumb) imageAttrs.src = item.thumb;
      const children = [
        createElement("img", { attrs: imageAttrs }),
        createElement("span", { className: "theater-thumb__label", text: item.title }),
      ];
      if (item.type === "video") {
        children.push(createElement("span", { className: "theater-thumb__badge", children: [createIcon("play", "sm")] }));
      }
      const thumb = createElement("button", {
        className: item.thumb ? "theater-thumb" : "theater-thumb is-pending",
        attrs: { type: "button", "aria-label": `Show ${item.title}` },
        children,
      });
      this.on(thumb, "click", () => this.select(index));
      this.on(children[0], "error", () => thumb.classList.add("is-fallback"), { once: true });
      this.#el.rail.append(createElement("li", { children: [thumb] }));
      this.#thumbs.push(thumb);
    });
  }

  #onKey(event) {
    if (!this.#open) return;
    if (event.key === "Escape") this.close();
    if (event.key === "ArrowRight") this.select(this.#playlist.index + 1);
    if (event.key === "ArrowLeft") this.select(this.#playlist.index - 1);
  }
}
