/** Your own API: receives RequestPayload.toJSON() as is. */
export const custom = Object.freeze({
  endpoint: null,
  origin: null,
  /** @param {import("../../RequestPayload.js").RequestPayload} payload */
  body(payload) {
    return payload.toJSON();
  },
});
