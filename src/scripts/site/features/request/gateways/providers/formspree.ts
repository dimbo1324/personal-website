import type { RequestPayload } from "../../RequestPayload";
import type { HttpProvider, ProviderOptions } from "./web3forms";

/** Formspree — the form id goes into the endpoint. */
export const formspree: HttpProvider = Object.freeze({
  endpoint: null,
  origin: "https://formspree.io",
  body(payload: RequestPayload, { subjectPrefix }: ProviderOptions) {
    return {
      _subject: payload.subject(subjectPrefix),
      ...(payload.email ? { _replyto: payload.email } : {}),
      ...payload.toJSON(),
    };
  },
});
