import type { RequestConfig } from "../../../data/request";
import { HttpGateway } from "./HttpGateway";
import { MailtoGateway } from "./MailtoGateway";
import type { RequestGateway } from "./RequestGateway";

/** Picks the delivery channel from configuration. */
export function createGateway(config: RequestConfig): RequestGateway {
  const http = config.http;
  const httpReady = Boolean(http.endpoint || (http.provider === "web3forms" && http.accessKey));
  const transport =
    config.transport === "auto" ? (httpReady ? "http" : "mailto") : config.transport;

  if (transport === "http") {
    return new HttpGateway({
      provider:
        http.provider === "web3forms" || http.provider === "formspree" ? http.provider : "custom",
      endpoint: http.endpoint,
      accessKey: http.accessKey,
      subjectPrefix: config.subjectPrefix,
    });
  }
  return new MailtoGateway({ recipient: config.recipient, subjectPrefix: config.subjectPrefix });
}
