import type { RequestPayload } from "../../RequestPayload";
import type { HttpProvider } from "./web3forms";

/** Your own API: receives RequestPayload.toJSON() as is. */
export const custom: HttpProvider = Object.freeze({
  endpoint: null,
  origin: null,
  body(payload: RequestPayload) {
    return payload.toJSON();
  },
});
