/**
 * Request form configuration.
 * transport: "mailto" — opens the visitor's mail app (works on any static host)
 *            "http"   — POST JSON to `endpoint` (Formspree, own API…);
 *                       remember to allow that origin in the CSP connect-src.
 */
export const REQUEST_CONFIG = Object.freeze({
  transport: "mailto",
  endpoint: null,
  recipient: "dmitriiprikhodko9@gmail.com",
  subjectPrefix: "Website request",
  limits: Object.freeze({ name: 60, email: 120, message: 1000 }),
  draftKey: "dp.request-draft",
});
