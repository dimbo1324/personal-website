import type { HeadPosition } from "./SerpentinePath";

interface TrailPoint {
  readonly x: number;
  readonly y: number;
}

/** The virtual print head: a soft glow blob with a short comet trail. */
export class PrintHead {
  static readonly TRAIL_LENGTH = 18;

  #trail: TrailPoint[] = [];

  reset(): void {
    this.#trail = [];
  }

  draw(
    context: CanvasRenderingContext2D,
    head: HeadPosition,
    isDark: boolean,
    alpha: number,
  ): void {
    this.#pushTrail(head);
    this.#drawGlow(context, head, isDark, alpha);
    this.#drawTrail(context, isDark, alpha);
  }

  #pushTrail(head: HeadPosition): void {
    const last = this.#trail.at(-1);
    if (last && Math.abs(last.y - head.yc) > 2) this.#trail = [];
    this.#trail.push({ x: head.x, y: head.yc });
    if (this.#trail.length > PrintHead.TRAIL_LENGTH) this.#trail.shift();
  }

  #drawGlow(
    context: CanvasRenderingContext2D,
    { x, y0, y1, yc }: HeadPosition,
    isDark: boolean,
    alpha: number,
  ): void {
    const radius = Math.max(50, (y1 - y0) * 0.75);
    const glow = context.createRadialGradient(x, yc, 0, x, yc, radius);
    glow.addColorStop(
      0,
      isDark ? `rgba(52, 214, 182, ${0.16 * alpha})` : `rgba(11, 122, 102, ${0.1 * alpha})`,
    );
    glow.addColorStop(
      0.5,
      isDark ? `rgba(242, 153, 74, ${0.04 * alpha})` : `rgba(180, 83, 9, ${0.03 * alpha})`,
    );
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.ellipse(x, yc, radius * 0.6, radius, 0, 0, Math.PI * 2);
    context.fill();
  }

  #drawTrail(context: CanvasRenderingContext2D, isDark: boolean, alpha: number): void {
    const length = this.#trail.length;
    this.#trail.forEach((point, index) => {
      const progress = index / length;
      context.fillStyle = isDark
        ? `rgba(242, 246, 247, ${(progress * 0.5 * alpha).toFixed(3)})`
        : `rgba(11, 107, 90, ${(progress * 0.45 * alpha).toFixed(3)})`;
      context.beginPath();
      context.arc(point.x, point.y, 0.6 + progress * 1.6, 0, Math.PI * 2);
      context.fill();
    });
  }
}
