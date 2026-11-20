/**
 * Appends an external <script> (async, no inline code — CSP friendly).
 * @param {string} src
 * @param {Record<string, string>} [dataset]  data-* attributes the provider reads
 * @returns {Promise<void>}
 */
export function loadScript(src, dataset = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    Object.entries(dataset).forEach(([key, value]) => {
      script.dataset[key] = value;
    });
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.append(script);
  });
}
