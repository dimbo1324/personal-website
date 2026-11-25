export type DotKind = "frame" | "field" | "text" | "button";

export interface DotTarget {
  readonly x: number;
  readonly y: number;
  readonly kind: DotKind;
}

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

const OUTLINE_STEP = 6;
const TEXT_STEP = 5;
const FILL_STEP = 5;

function outline(rect: Rect, step: number, kind: DotKind, out: DotTarget[]): void {
  const { x, y, w, h } = rect;
  for (let px = x; px <= x + w; px += step) {
    out.push({ x: px, y, kind }, { x: px, y: y + h, kind });
  }
  for (let py = y + step; py < y + h; py += step) {
    out.push({ x, y: py, kind }, { x: x + w, y: py, kind });
  }
}

function textLines(rect: Rect, lineHeight: number, kind: DotKind, out: DotTarget[]): void {
  const lines = Math.max(1, Math.round(rect.h / lineHeight));
  for (let line = 0; line < lines; line += 1) {
    const y = rect.y + (line + 0.5) * (rect.h / lines);
    for (let px = rect.x; px <= rect.x + rect.w; px += TEXT_STEP) out.push({ x: px, y, kind });
  }
}

function fill(rect: Rect, kind: DotKind, out: DotTarget[]): void {
  for (let py = rect.y + FILL_STEP / 2; py < rect.y + rect.h; py += FILL_STEP) {
    for (let px = rect.x + FILL_STEP / 2; px < rect.x + rect.w; px += FILL_STEP)
      out.push({ x: px, y: py, kind });
  }
}

function localRect(element: Element, origin: DOMRect): Rect {
  const rect = element.getBoundingClientRect();
  return { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height };
}

function textRect(element: Element, origin: DOMRect): Rect {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rect = range.getBoundingClientRect();
  return { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height };
}

/** Turns the request card layout into dot targets (card-local px). */
export function collectDotTargets(
  card: HTMLElement,
  { maxDots = 3200 }: { readonly maxDots?: number } = {},
): DotTarget[] {
  const origin = card.getBoundingClientRect();
  const dots: DotTarget[] = [];

  outline(
    { x: 1, y: 1, w: origin.width - 2, h: origin.height - 2 },
    OUTLINE_STEP + 2,
    "frame",
    dots,
  );
  card.querySelectorAll(".field__control, .checkbox__box").forEach((element) => {
    outline(localRect(element, origin), OUTLINE_STEP, "field", dots);
  });
  card
    .querySelectorAll(
      ".field__label, .form-group__legend, .form-group__hint, .request-form__note, .checkbox__label, .request-form__hint",
    )
    .forEach((element) => {
      const rect = textRect(element, origin);
      if (rect.w > 0)
        textLines(rect, parseFloat(getComputedStyle(element).lineHeight) || 18, "text", dots);
    });
  card
    .querySelectorAll(".request-form__actions .button")
    .forEach((element) => fill(localRect(element, origin), "button", dots));

  if (dots.length <= maxDots) return dots;
  const stride = dots.length / maxDots;
  return Array.from({ length: maxDots }, (_, index) => dots[Math.floor(index * stride)]).filter(
    (dot): dot is DotTarget => dot !== undefined,
  );
}
