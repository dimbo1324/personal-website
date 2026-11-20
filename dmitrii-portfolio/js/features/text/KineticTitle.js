import { Component } from "../../core/Component.js";
import { createElement } from "../../core/dom.js";
import { ticker } from "../../core/Ticker.js";
import { motion } from "../../core/MotionPreference.js";
import { lerp } from "../../core/math.js";

/**
 * Hero name with three behaviours:
 *  1. staggered reveal from a mask on load;
 *  2. "weight lens" — letters near the pointer thin out (variable font axis);
 *  3. click ripple — letters jump in a wave starting from the clicked one.
 */
export class KineticTitle extends Component {
  static REST_WEIGHT = 800;
  static LENS_WEIGHT = 300;
  static LENS_RADIUS = 110;
  static STAGGER_MS = 34;

  /** @type {{ el: HTMLElement, cx: number, cy: number, weight: number, target: number }[]} */
  #chars = [];
  #removeTick = null;
  #pointer = null;

  mount() {
    this.#split();
    requestAnimationFrame(() => this.root.classList.add("is-revealed"));
    const revealTime = 900 + this.#chars.length * KineticTitle.STAGGER_MS;
    window.setTimeout(() => this.root.classList.add("is-live"), revealTime);

    if (!motion.reduced) {
      this.on(this.root, "pointerenter", () => this.#measure());
      this.on(this.root, "pointermove", (event) => this.#onPointerMove(event));
      this.on(this.root, "pointerleave", () => this.#onPointerLeave());
      this.on(this.root, "click", (event) => this.#ripple(event));
      this.on(window, "resize", () => this.#measure(), { passive: true });
    }
    return super.mount();
  }

  onDestroy() {
    this.#removeTick?.();
  }

  #split() {
    let index = 0;
    this.root.querySelectorAll("[data-kinetic-text]").forEach((/** @type {HTMLElement} */ line) => {
      const text = line.dataset.kineticText ?? line.textContent;
      line.textContent = "";
      line.setAttribute("aria-hidden", "true");
      [...text].forEach((char) => {
        const span = createElement("span", { className: "kinetic-title__char", text: char });
        span.style.setProperty("--reveal-delay", `${index * KineticTitle.STAGGER_MS}ms`);
        line.append(createElement("span", { className: "kinetic-title__mask", children: [span] }));
        this.#chars.push({ el: span, cx: 0, cy: 0, weight: KineticTitle.REST_WEIGHT, target: KineticTitle.REST_WEIGHT });
        index += 1;
      });
    });
  }

  #measure() {
    this.#chars.forEach((char) => {
      const rect = char.el.getBoundingClientRect();
      char.cx = rect.left + rect.width / 2;
      char.cy = rect.top + rect.height / 2;
    });
  }

  #onPointerMove(event) {
    if (!this.root.classList.contains("is-live")) return;
    this.#pointer = { x: event.clientX, y: event.clientY };
    const { REST_WEIGHT, LENS_WEIGHT, LENS_RADIUS } = KineticTitle;
    this.#chars.forEach((char) => {
      const distance = Math.hypot(char.cx - this.#pointer.x, char.cy - this.#pointer.y);
      const influence = Math.exp(-((distance / LENS_RADIUS) ** 2));
      char.target = lerp(REST_WEIGHT, LENS_WEIGHT, influence);
    });
    this.#startTicking();
  }

  #onPointerLeave() {
    this.#pointer = null;
    this.#chars.forEach((char) => {
      char.target = KineticTitle.REST_WEIGHT;
    });
    this.#startTicking();
  }

  #startTicking() {
    if (this.#removeTick) return;
    this.#removeTick = ticker.add(() => this.#tick());
  }

  #tick() {
    let settled = true;
    this.#chars.forEach((char) => {
      const next = lerp(char.weight, char.target, 0.18);
      if (Math.abs(next - char.target) > 0.5) settled = false;
      char.weight = Math.abs(next - char.target) > 0.5 ? next : char.target;
      char.el.style.setProperty("--wght", char.weight.toFixed(0));
    });
    if (settled) {
      this.#removeTick?.();
      this.#removeTick = null;
      if (!this.#pointer) this.#measure(); // widths changed back — refresh centers
    }
  }

  #ripple(event) {
    const origin = event.target.closest?.(".kinetic-title__char");
    const originIndex = origin ? this.#chars.findIndex((char) => char.el === origin) : 0;
    this.#chars.forEach((char, index) => {
      const { el } = char;
      el.classList.remove("is-jumping");
      void el.offsetWidth;
      el.style.setProperty("--jump-delay", `${Math.abs(index - originIndex) * 38}ms`);
      el.classList.add("is-jumping");
      el.addEventListener("animationend", () => el.classList.remove("is-jumping"), { once: true });
    });
  }
}
