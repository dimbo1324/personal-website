/**
 * Content-Security-Policy for the production build, computed from the
 * same settings the code uses, so enabling a form back-end or analytics
 * never silently breaks on a CSP violation.
 */

const ORIGINS = Object.freeze({
  unsplash: "https://images.unsplash.com",
  web3forms: "https://api.web3forms.com",
  formspree: "https://formspree.io",
  plausible: "https://plausible.io",
  umami: "https://cloud.umami.is",
});

const originOf = (url) => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/**
 * @param {{ remoteImages?: boolean,
 *           form?: { provider?: string | null, endpoint?: string | null, accessKey?: string | null },
 *           analytics?: { provider?: string | null, src?: string | null } }} options
 * @returns {string}
 */
export function buildCsp({ remoteImages = true, form = {}, analytics = {} } = {}) {
  const connect = new Set(["'self'"]);
  const scripts = new Set(["'self'"]);
  const images = new Set(["'self'", "data:", "blob:"]);

  if (remoteImages) images.add(ORIGINS.unsplash);

  // same rule as createGateway(): an explicit endpoint, or Web3Forms with its access key
  if (form.endpoint) {
    const origin = originOf(form.endpoint);
    if (origin) connect.add(origin);
  } else if (form.provider === "web3forms" && form.accessKey) {
    connect.add(ORIGINS.web3forms);
  }

  if (analytics.provider === "plausible" || analytics.provider === "umami") {
    const origin = analytics.src ? originOf(analytics.src) : ORIGINS[analytics.provider];
    if (origin) {
      scripts.add(origin);
      connect.add(origin);
    }
  }

  const directives = {
    "default-src": ["'self'"],
    "script-src": [...scripts],
    "style-src": ["'self'"],
    "font-src": ["'self'"],
    "img-src": [...images],
    "media-src": ["'self'", "blob:"],
    "connect-src": [...connect],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'none'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  };
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(" "))
    .join("; ");
}

/**
 * Netlify / Cloudflare Pages "_headers" file. (GitHub Pages ignores it;
 * there the CSP can be delivered by a proxy such as Cloudflare.)
 * @param {string} csp
 */
export function buildHeadersFile(csp) {
  return [
    "/*",
    `  Content-Security-Policy: ${csp}`,
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "  X-Frame-Options: DENY",
    "  Cross-Origin-Opener-Policy: same-origin",
    "",
    "/assets/*",
    "  Cache-Control: public, max-age=604800",
    "",
    "/bundle/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
  ].join("\n");
}
