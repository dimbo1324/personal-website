import { ticker } from "./Ticker.js";
import { easeOutCubic } from "./easing.js";

/**
 * Time-based tween on the shared ticker.
 * @param {{ duration: number, easing?: (t:number)=>number, onUpdate: (eased:number)=>void, onComplete?: ()=>void }} options
 * @returns {() => void} cancel
 */
export function tween({ duration, easing = easeOutCubic, onUpdate, onComplete }) {
  const start = performance.now();
  let remove = null;
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
