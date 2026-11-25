export function whenPageIdle({ timeout = 1500 } = {}): Promise<void> {
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });

  return loaded.then(
    () =>
      new Promise<void>((resolve) => {
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(() => resolve(), { timeout });
        } else {
          window.setTimeout(resolve, Math.min(timeout, 300));
        }
      }),
  );
}
