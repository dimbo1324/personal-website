import { MailtoGateway } from "./MailtoGateway.js";
import { HttpGateway } from "./HttpGateway.js";

/** Factory: picks the delivery channel from configuration. */
export function createGateway(config) {
  switch (config.transport) {
    case "http":
      return new HttpGateway({ endpoint: config.endpoint });
    case "mailto":
    default:
      return new MailtoGateway({ recipient: config.recipient, subjectPrefix: config.subjectPrefix });
  }
}
