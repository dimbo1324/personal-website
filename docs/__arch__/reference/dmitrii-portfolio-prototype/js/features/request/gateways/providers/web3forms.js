/**
 * Web3Forms (https://web3forms.com) — free, no backend; the access key is
 * public by design (it only lets people send mail to your own inbox).
 */
export const web3forms = Object.freeze({
  endpoint: "https://api.web3forms.com/submit",
  origin: "https://api.web3forms.com",
  /** @param {import("../../RequestPayload.js").RequestPayload} payload */
  body(payload, { accessKey, subjectPrefix }) {
    return {
      access_key: accessKey,
      subject: payload.subject(subjectPrefix),
      from_name: payload.fullName,
      ...(payload.email ? { email: payload.email, replyto: payload.email } : {}),
      phone: payload.phone || undefined,
      message: payload.toPlainText(),
      botcheck: false,
    };
  },
});
