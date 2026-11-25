export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const clamp01 = (value) => clamp(value, 0, 1);

export const lerp = (from, to, t) => from + (to - from) * t;

export const rand = (min, max) => min + Math.random() * (max - min);

export const randInt = (min, max) => Math.round(rand(min, max));

/** Map a value from one range into another. */
export const mapRange = (value, inMin, inMax, outMin, outMax) => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
