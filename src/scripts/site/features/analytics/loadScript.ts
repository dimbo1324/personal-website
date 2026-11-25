export function loadScript(
  src: string,
  dataset: Readonly<Record<string, string>> = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    for (const [key, value] of Object.entries(dataset)) {
      script.dataset[key] = value;
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
      once: true,
    });
    document.head.append(script);
  });
}
