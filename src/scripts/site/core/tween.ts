import { ticker } from "./ticker";
import { easeOutCubic } from "./animation";

interface TweenOptions {
  duration: number;
  easing?: (t: number) => number;
  onUpdate: (eased: number) => void;
  onComplete?: () => void;
}

export function tween({
  duration,
  easing = easeOutCubic,
  onUpdate,
  onComplete,
}: TweenOptions): () => void {
  const start = performance.now();
  let remove: (() => void) | null = null;
  remove = ticker.add((now) => {
    const t = Math.min(1, (now - start) / duration);
    onUpdate(easing(t));
    if (t >= 1) {
      remove?.();
      onComplete?.();
    }
  });
  return () => remove?.();
}
