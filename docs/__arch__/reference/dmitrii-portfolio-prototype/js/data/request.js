import { ENV } from "../config/env.js";

/**
 * Request form configuration.
 * transport: "auto"   — POST when a form back-end is configured, otherwise mailto
 *            "http"   — always POST to `http` (Web3Forms, Formspree, own API)
 *            "mailto" — always open the visitor's mail app (works on any static host)
 * The back-end comes from VITE_FORM_* build variables (.env.example).
 */
export const REQUEST_CONFIG = Object.freeze({
  transport: "auto",
  http: ENV.form,
  recipient: "dmitriiprikhodko9@gmail.com",
  subjectPrefix: "Website request",
  limits: Object.freeze({ name: 60, email: 120, message: 1000 }),
  draftKey: "dp.request-draft",
});
