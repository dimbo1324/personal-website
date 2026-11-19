/**
 * Turns the layout of the request card into dot targets (card-local px):
 * outlines for the card, inputs and checkbox; a dotted "text line" for labels;
 * a dotted fill for the submit button. Pure geometry.
 */

const OUTLINE_STEP = 6;
const TEXT_STEP = 5;
const FILL_STEP = 5;

function outline(rect, step, kind, out) {
  const { x, y, w, h } = rect;
  for (let px = x; px <= x + w; px += step) {
    out.push({ x: px, y, kind }, { x: px, y: y + h, kind });
  }
  for (let py = y + step; py < y + h; py += step) {
    out.push({ x, y: py, kind }, { x: x + w, y: py, kind });
  }
}

function textLines(rect, lineHeight, kind, out) {
  const lines = Math.max(1, Math.round(rect.h / lineHeight));
  for (let line = 0; line < lines; line += 1) {
    const y = rect.y + (line + 0.5) * (rect.h / lines);
    for (let px = rect.x; px <= rect.x + rect.w; px += TEXT_STEP) out.push({ x: px, y, kind });
  }
}

function fill(rect, kind, out) {
  for (let py = rect.y + FILL_STEP / 2; py < rect.y + rect.h; py += FILL_STEP) {
    for (let px = rect.x + FILL_STEP / 2; px < rect.x + rect.w; px += FILL_STEP) out.push({ x: px, y: py, kind });
  }
}

/** Element rect relative to the card. */
function localRect(element, origin) {
  const r = element.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
}

/** Width of the actual text (labels are often block-level and wider). */
function textRect(element, origin) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const r = range.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
}

/**
 * @param {HTMLElement} card
 * @param {{ maxDots?: number }} [options]
 * @returns {{ x: number, y: number, kind: "frame"|"field"|"text"|"button" }[]}
 */
export function collectDotTargets(card, { maxDots = 3200 } = {}) {
  const origin = card.getBoundingClientRect();
  const dots = [];

  outline({ x: 1, y: 1, w: origin.width - 2, h: origin.height - 2 }, OUTLINE_STEP + 2, "frame", dots);
  card.querySelectorAll(".field__control, .checkbox__box").forEach((el) => outline(localRect(el, origin), OUTLINE_STEP, "field", dots));
  card
    .querySelectorAll(".field__label, .form-group__legend, .form-group__hint, .request-form__note, .checkbox__label, .request-form__hint")
    .forEach((el) => {
      const rect = textRect(el, origin);
      if (rect.w > 0) textLines(rect, parseFloat(getComputedStyle(el).lineHeight) || 18, "text", dots);
    });
  card.querySelectorAll(".request-form__actions .button").forEach((el) => fill(localRect(el, origin), "button", dots));

  if (dots.length <= maxDots) return dots;
  const stride = dots.length / maxDots;
  return Array.from({ length: maxDots }, (_, i) => dots[Math.floor(i * stride)]);
}
