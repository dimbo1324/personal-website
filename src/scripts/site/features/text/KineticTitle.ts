import { Component } from "../../core/component";
import { createElement } from "../../core/dom";
import { lerp } from "../../core/animation";
import { motion } from "../../core/motion";
import { ticker } from "../../core/ticker";

interface KineticChar {
  readonly el: HTMLElement;
  cx: number;
  cy: number;
  weight: number;
  target: number;
}

/**
 * Hero name with three behaviours:
 *  1. staggered reveal from a mask on load;
 *  2. "weight lens" — letters near the pointer thin out (variable font axis);
 *  3. click ripple — letters jump in a wave starting from the clicked one.
 */
export class KineticTitle extends Component<HTMLElement> {
  static readonly REST_WEIGHT = 800;
  static readonly LENS_WEIGHT = 300;
  static readonly LENS_RADIUS = 110;
  static readonly STAGGER_MS = 34;

  readonly #chars: KineticChar[] = [];
  #removeTick: (() => void) | null = null;
  #pointer: { readonly x: number; readonly y: number } | null = null;

  override mount(): this {
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

  protected override onDestroy(): void {
    this.#removeTick?.();
  }

  #split(): void {
    let index = 0;
    for (const line of Array.from(this.root.querySelectorAll<HTMLElement>("[data-kinetic-text]"))) {
      const text = line.dataset.kineticText ?? line.textContent ?? "";
      line.textContent = "";
      line.setAttribute("aria-hidden", "true");
      for (const char of Array.from(text)) {
        const span = createElement("span", { className: "kinetic-title__char", text: char });
        span.style.setProperty("--reveal-delay", `${index * KineticTitle.STAGGER_MS}ms`);
        line.append(createElement("span", { className: "kinetic-title__mask", children: [span] }));
        this.#chars.push({
          el: span,
          cx: 0,
          cy: 0,
          weight: KineticTitle.REST_WEIGHT,
          target: KineticTitle.REST_WEIGHT,
        });
        index += 1;
      }
    }
  }

  #measure(): void {
    for (const char of this.#chars) {
      const rect = char.el.getBoundingClientRect();
      char.cx = rect.left + rect.width / 2;
      char.cy = rect.top + rect.height / 2;
    }
  }

  #onPointerMove(event: PointerEvent): void {
    if (!this.root.classList.contains("is-live")) return;
    const pointer = { x: event.clientX, y: event.clientY };
    this.#pointer = pointer;
    const { REST_WEIGHT, LENS_WEIGHT, LENS_RADIUS } = KineticTitle;
    for (const char of this.#chars) {
      const distance = Math.hypot(char.cx - pointer.x, char.cy - pointer.y);
      const influence = Math.exp(-((distance / LENS_RADIUS) ** 2));
      char.target = lerp(REST_WEIGHT, LENS_WEIGHT, influence);
    }
    this.#startTicking();
  }

  #onPointerLeave(): void {
    this.#pointer = null;
    for (const char of this.#chars) char.target = KineticTitle.REST_WEIGHT;
    this.#startTicking();
  }

  #startTicking(): void {
    if (this.#removeTick) return;
    this.#removeTick = ticker.add(() => this.#tick());
  }

  #tick(): void {
    let settled = true;
    for (const char of this.#chars) {
      const next = lerp(char.weight, char.target, 0.18);
      if (Math.abs(next - char.target) > 0.5) settled = false;
      char.weight = Math.abs(next - char.target) > 0.5 ? next : char.target;
      char.el.style.setProperty("--wght", char.weight.toFixed(0));
    }
    if (settled) {
      this.#removeTick?.();
      this.#removeTick = null;
      if (!this.#pointer) this.#measure();
    }
  }

  #ripple(event: MouseEvent): void {
    const target = event.target;
    const origin = target instanceof Element ? target.closest(".kinetic-title__char") : null;
    const originIndex = origin ? this.#chars.findIndex((char) => char.el === origin) : 0;
    for (const [index, char] of this.#chars.entries()) {
      const { el } = char;
      el.classList.remove("is-jumping");
      void el.offsetWidth;
      el.style.setProperty("--jump-delay", `${Math.abs(index - originIndex) * 38}ms`);
      el.classList.add("is-jumping");
      el.addEventListener("animationend", () => el.classList.remove("is-jumping"), { once: true });
    }
  }
}
