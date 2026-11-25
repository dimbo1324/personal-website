import { Component } from "../../core/component";
import { clamp01, easeInOutCubic, easeOutCubic, lerp, rand } from "../../core/animation";
import { motion } from "../../core/motion";
import { ticker } from "../../core/ticker";
import type { DotTarget } from "./dotTargets";
import { collectDotTargets } from "./dotTargets";

interface PrintDot extends DotTarget {
  readonly sx: number;
  readonly sy: number;
  readonly delay: number;
  readonly radius: number;
}

/** The request card is "printed" from dots the first time it scrolls into view. */
export class FormAssembly extends Component<HTMLElement> {
  static readonly FLIGHT_MS = 900;
  static readonly WAVE_MS = 900;
  static readonly HOLD_MS = 180;
  static readonly FADE_MS = 650;

  readonly #isDark: () => boolean;
  #canvas: HTMLCanvasElement | null = null;
  #context: CanvasRenderingContext2D | null = null;
  #dots: PrintDot[] = [];
  #start = 0;
  #removeTick: (() => void) | null = null;
  #size = { width: 0, height: 0 };
  #done = false;

  constructor(root: HTMLElement, { isDark }: { readonly isDark: () => boolean }) {
    super(root);
    this.#isDark = isDark;
  }

  override mount(): this {
    if (motion.reduced || !("IntersectionObserver" in window)) return super.mount();

    this.root.classList.add("is-assembling");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        requestAnimationFrame(() => this.#play());
      },
      { threshold: 0.25 },
    );
    observer.observe(this.root);
    this.own(() => observer.disconnect());
    return super.mount();
  }

  protected override onDestroy(): void {
    this.#removeTick?.();
    this.#canvas?.remove();
  }

  #play(): void {
    const rect = this.root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.#size = { width: rect.width, height: rect.height };

    const canvas = document.createElement("canvas");
    canvas.className = "request-card__canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.root.append(canvas);
    this.#canvas = canvas;
    this.#context = context;

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

  #frame(now: number): void {
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
    const context = this.#context;
    const canvas = this.#canvas;
    if (fade <= 0) {
      this.#removeTick?.();
      this.#removeTick = null;
      canvas?.remove();
      this.#canvas = null;
      return;
    }
    if (!context) return;

    const dark = this.#isDark();
    const colors: Record<DotTarget["kind"], string> = {
      frame: dark ? "154, 194, 200" : "84, 110, 122",
      field: dark ? "52, 214, 182" : "11, 122, 102",
      text: dark ? "189, 208, 214" : "38, 56, 63",
      button: dark ? "242, 153, 74" : "180, 83, 9",
    };

    context.clearRect(0, 0, this.#size.width, this.#size.height);
    for (const dot of this.#dots) {
      const progress = clamp01((elapsed - dot.delay) / FLIGHT_MS);
      if (progress <= 0) continue;
      const eased = easeOutCubic(progress);
      const x = lerp(dot.sx, dot.x, eased);
      const y = lerp(dot.sy, dot.y, eased);
      const alpha = Math.min(1, progress * 2.2) * fade * (dot.kind === "frame" ? 0.55 : 0.9);
      context.fillStyle = `rgba(${colors[dot.kind]}, ${alpha.toFixed(3)})`;
      context.beginPath();
      context.arc(x, y, dot.radius * (1 + (1 - eased) * 0.8), 0, Math.PI * 2);
      context.fill();
    }
  }
}
