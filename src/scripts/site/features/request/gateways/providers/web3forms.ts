import type { RequestPayload } from "../../RequestPayload";

export interface ProviderOptions {
  readonly accessKey: string | null;
  readonly subjectPrefix: string;
}

export interface HttpProvider {
  readonly endpoint: string | null;
  readonly origin: string | null;
  readonly body: (payload: RequestPayload, options: ProviderOptions) => object;
}

/** Web3Forms — free, no backend; the access key is public by design. */
export const web3forms: HttpProvider = Object.freeze({
  endpoint: "https://api.web3forms.com/submit",
  origin: "https://api.web3forms.com",
  body(payload: RequestPayload, { accessKey, subjectPrefix }: ProviderOptions) {
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
