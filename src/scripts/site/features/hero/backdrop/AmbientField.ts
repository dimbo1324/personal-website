import { rand } from "../../../core/animation";

interface AmbientDot {
  x: number;
  y: number;
  readonly vx: number;
  readonly drift: number;
  readonly frequency: number;
  readonly radius: number;
  readonly alpha: number;
  readonly amber: boolean;
  readonly phase: number;
}

/** Calm idle particles with slow constant drift and no flicker. */
export class AmbientField {
  #dots: AmbientDot[] = [];

  build(width: number, height: number): void {
    const count = width < 768 ? 22 : 38;
    this.#dots = Array.from({ length: count }, () => ({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(0.1, 0.32),
      drift: rand(6, 18),
      frequency: rand(0.00025, 0.0006),
      radius: rand(0.8, 1.35),
      alpha: rand(0.16, 0.34),
      amber: Math.random() > 0.74,
      phase: rand(0, Math.PI * 2),
    }));
  }

  draw(
    context: CanvasRenderingContext2D,
    now: number,
    width: number,
    height: number,
    isDark: boolean,
  ): void {
    for (const dot of this.#dots) {
      dot.x += dot.vx;
      if (dot.x > width + 4) {
        dot.x = -4;
        dot.y = rand(0, height);
      }
      const y = dot.y + Math.sin(now * dot.frequency + dot.phase) * dot.drift;
      const edge = Math.min(1, dot.x / 80, (width - dot.x) / 80);
      const alpha = Math.max(0, dot.alpha * edge).toFixed(3);
      context.fillStyle = dot.amber
        ? `rgba(242, 153, 74, ${alpha})`
        : isDark
          ? `rgba(52, 214, 182, ${alpha})`
          : `rgba(11, 122, 102, ${alpha})`;
      context.beginPath();
      context.arc(dot.x, y, dot.radius, 0, Math.PI * 2);
      context.fill();
    }
  }
}
