import type { FormEnvironment } from "../config/env";
import { ENV } from "../config/env";

export type RequestTransport = "auto" | "http" | "mailto" | "demo";

export interface RequestLimits {
  readonly name: number;
  readonly email: number;
  readonly message: number;
}

export interface RequestConfig {
  readonly transport: RequestTransport;
  readonly http: FormEnvironment;
  readonly recipient: string;
  readonly subjectPrefix: string;
  readonly limits: RequestLimits;
  readonly draftKey: string;
}

/**
 * Request form configuration.
 * transport: "auto"   — POST when a form back-end is configured, otherwise mailto
 *            "http"   — always POST to `http` (Web3Forms, Formspree, own API)
 *            "mailto" — always open the visitor's mail app (works on any static host)
 *            "demo"   — validate and acknowledge without a network call
 * The back-end comes from PUBLIC_FORM_* build variables (.env.example); the demo
 * transport appears only when PUBLIC_LEAD_MODE=demo is set explicitly.
 */
export const REQUEST_CONFIG: RequestConfig = Object.freeze({
  transport: ENV.leadMode === "demo" ? "demo" : "auto",
  http: ENV.form,
  recipient: "dmitriiprikhodko9@gmail.com",
  subjectPrefix: "Website request",
  limits: Object.freeze({ name: 60, email: 120, message: 1000 }),
  draftKey: "dp.request-draft",
});
