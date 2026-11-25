import { MailtoGateway } from "./MailtoGateway.js";
import { HttpGateway } from "./HttpGateway.js";

/**
 * Factory: picks the delivery channel from configuration.
 *   "http"   → always POST (throws if nothing to post to)
 *   "mailto" → always the visitor's mail app
 *   "auto"   → POST when an endpoint or a Web3Forms key is configured, otherwise mailto
 *
 * @typedef {{ transport: string, recipient: string, subjectPrefix: string,
 *             http?: { provider?: string, endpoint?: string | null, accessKey?: string | null } }} GatewayConfig
 * @param {GatewayConfig} config
 */
export function createGateway(config) {
  const http = config.http ?? {};
  const httpReady = Boolean(http.endpoint || (http.provider === "web3forms" && http.accessKey));
  const transport = config.transport === "auto" ? (httpReady ? "http" : "mailto") : config.transport;

  if (transport === "http") {
    return new HttpGateway({ ...http, provider: /** @type {any} */ (http.provider), subjectPrefix: config.subjectPrefix });
  }
  return new MailtoGateway({ recipient: config.recipient, subjectPrefix: config.subjectPrefix });
}
