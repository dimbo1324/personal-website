import { Component } from "../../core/Component.js";
import { ticker } from "../../core/Ticker.js";
import { motion } from "../../core/MotionPreference.js";
import { rand, clamp01, lerp } from "../../core/math.js";
import { easeOutCubic, easeInOutCubic } from "../../core/easing.js";
import { collectDotTargets } from "./dotTargets.js";

/**
 * The first time the request card scrolls into view it is "printed" from
 * dots: particles drift in from a soft cloud and settle — in a left → right
 * wave, like the hero render — onto the outlines of the card, its fields,
 * labels and button. Then the real form materialises and the dots fade.
 */
export class FormAssembly extends Component {
  static FLIGHT_MS = 900;
  static WAVE_MS = 900;
  static HOLD_MS = 180;
  static FADE_MS = 650;

  #canvas;
  #context;
  #dots = [];
  #start = 0;
  #removeTick = null;
  #isDark;
  #size = { width: 0, height: 0 };
  #done = false;

  /**
   * @param {HTMLElement} root  the request card
   * @param {{ isDark: () => boolean }} options
   */
  constructor(root, { isDark }) {
    super(root);
    this.#isDark = isDark;
  }

  mount() {
    if (motion.reduced || !("IntersectionObserver" in window)) return super.mount();

    this.root.classList.add("is-assembling");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        // wait a frame so fonts/layout are final before measuring
        requestAnimationFrame(() => this.#play());
      },
      { threshold: 0.25 },
    );
    observer.observe(this.root);
    this.own(() => observer.disconnect());
    return super.mount();
  }

  onDestroy() {
    this.#removeTick?.();
    this.#canvas?.remove();
  }

  #play() {
    const rect = this.root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.#size = { width: rect.width, height: rect.height };

    this.#canvas = document.createElement("canvas");
    this.#canvas.className = "request-card__canvas";
    this.#canvas.setAttribute("aria-hidden", "true");
    this.#canvas.width = Math.round(rect.width * dpr);
    this.#canvas.height = Math.round(rect.height * dpr);
    this.#context = this.#canvas.getContext("2d");
    this.#context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.root.append(this.#canvas);

    const { width, height } = this.#size;
    this.#dots = collectDotTargets(this.root).map((target) => {
      const angle = rand(0, Math.PI * 2);
      const spread = rand(40, 160);
      return {
        ...target,
        sx: target.x + Math.cos(angle) * spread - 60,
        sy: target.y + Math.sin(angle) * spread * 0.6,
        delay: (target.x / width) * FormAssembly.WAVE_MS + (target.y / height) * 120 + rand(0, 160),
        radius: target.kind === "frame" ? 0.9 : target.kind === "text" ? 0.85 : 1.05,
      };
    });

    this.#start = performance.now();
    this.#removeTick = ticker.add((now) => this.#frame(now));
  }

  #frame(now) {
    const elapsed = now - this.#start;
    const { FLIGHT_MS, WAVE_MS, HOLD_MS, FADE_MS } = FormAssembly;
    const assembledAt = WAVE_MS + 300 + FLIGHT_MS;
    const fadeStart = assembledAt + HOLD_MS;

    if (!this.#done && elapsed >= fadeStart) {
      this.#done = true;
      this.root.classList.remove("is-assembling");
      this.root.classList.add("is-assembled");
    }

    const fade = 1 - easeInOutCubic(clamp01((elapsed - fadeStart) / FADE_MS));
    if (fade <= 0) {
      this.#removeTick?.();
      this.#removeTick = null;
      this.#canvas.remove();
      return;
    }

    const context = this.#context;
    const dark = this.#isDark();
    const colors = {
      frame: dark ? "154, 194, 200" : "84, 110, 122",
      field: dark ? "52, 214, 182" : "11, 122, 102",
      text: dark ? "189, 208, 214" : "38, 56, 63",
      button: dark ? "242, 153, 74" : "180, 83, 9",
    };

    context.clearRect(0, 0, this.#size.width, this.#size.height);
    for (const dot of this.#dots) {
      const t = clamp01((elapsed - dot.delay) / FLIGHT_MS);
      if (t <= 0) continue;
      const e = easeOutCubic(t);
      const x = lerp(dot.sx, dot.x, e);
      const y = lerp(dot.sy, dot.y, e);
      const alpha = Math.min(1, t * 2.2) * fade * (dot.kind === "frame" ? 0.55 : 0.9);
      context.fillStyle = `rgba(${colors[dot.kind]}, ${alpha.toFixed(3)})`;
      context.beginPath();
      context.arc(x, y, dot.radius * (1 + (1 - e) * 0.8), 0, Math.PI * 2);
      context.fill();
    }
  }
}
