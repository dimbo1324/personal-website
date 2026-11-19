/**
 * The virtual print head: a soft glow blob with a short comet trail.
 * No hard lines — the dots themselves draw the sweep.
 */
export class PrintHead {
  static TRAIL_LENGTH = 18;

  #trail = [];

  reset() {
    this.#trail = [];
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {ReturnType<import("./SerpentinePath.js").SerpentinePath["headAt"]>} head
   * @param {boolean} isDark
   * @param {number} alpha 0..1 (edge fade)
   */
  draw(context, head, isDark, alpha) {
    this.#pushTrail(head);
    this.#drawGlow(context, head, isDark, alpha);
    this.#drawTrail(context, isDark, alpha);
  }

  #pushTrail(head) {
    const last = this.#trail[this.#trail.length - 1];
    if (last && Math.abs(last.y - head.yc) > 2) this.#trail = []; // head turned around
    this.#trail.push({ x: head.x, y: head.yc });
    if (this.#trail.length > PrintHead.TRAIL_LENGTH) this.#trail.shift();
  }

  #drawGlow(context, { x, y0, y1, yc }, isDark, alpha) {
    const radius = Math.max(50, (y1 - y0) * 0.75);
    const glow = context.createRadialGradient(x, yc, 0, x, yc, radius);
    glow.addColorStop(0, isDark ? `rgba(52, 214, 182, ${0.16 * alpha})` : `rgba(11, 122, 102, ${0.1 * alpha})`);
    glow.addColorStop(0.5, isDark ? `rgba(242, 153, 74, ${0.04 * alpha})` : `rgba(180, 83, 9, ${0.03 * alpha})`);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.ellipse(x, yc, radius * 0.6, radius, 0, 0, Math.PI * 2);
    context.fill();
  }

  #drawTrail(context, isDark, alpha) {
    const length = this.#trail.length;
    this.#trail.forEach((point, index) => {
      const t = index / length;
      context.fillStyle = isDark ? `rgba(242, 246, 247, ${(t * 0.5 * alpha).toFixed(3)})` : `rgba(11, 107, 90, ${(t * 0.45 * alpha).toFixed(3)})`;
      context.beginPath();
      context.arc(point.x, point.y, 0.6 + t * 1.6, 0, Math.PI * 2);
      context.fill();
    });
  }
}
