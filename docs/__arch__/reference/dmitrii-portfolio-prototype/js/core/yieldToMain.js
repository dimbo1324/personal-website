/**
 * Gives the browser a chance to handle input and paint between chunks of
 * work (splits one long task into several short ones).
 * Uses scheduler.yield() where available, a macrotask otherwise.
 * @returns {Promise<void>}
 */
export function yieldToMain() {
  const scheduler = /** @type {any} */ (globalThis).scheduler;
  if (typeof scheduler?.yield === "function") return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
