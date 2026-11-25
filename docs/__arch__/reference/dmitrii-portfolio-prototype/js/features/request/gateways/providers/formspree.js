/**
 * Formspree (https://formspree.io) — the form id goes into the endpoint:
 * https://formspree.io/f/<id>.
 */
export const formspree = Object.freeze({
  endpoint: null,
  origin: "https://formspree.io",
  /** @param {import("../../RequestPayload.js").RequestPayload} payload */
  body(payload, { subjectPrefix }) {
    return {
      _subject: payload.subject(subjectPrefix),
      ...(payload.email ? { _replyto: payload.email } : {}),
      ...payload.toJSON(),
    };
  },
});
