import { describe, expect, it, vi } from "vitest";
import { RequestPayload } from "../src/scripts/site/features/request/RequestPayload";
import { MailtoGateway } from "../src/scripts/site/features/request/gateways/MailtoGateway";
import { HttpGateway } from "../src/scripts/site/features/request/gateways/HttpGateway";
import { createGateway } from "../src/scripts/site/features/request/gateways/createGateway";
import type { RequestConfig } from "../src/scripts/site/data/request";

const payload = new RequestPayload({
  lastName: "Prikhodko",
  firstName: "Dmitrii",
  phone: "+598 96 671 725",
  email: "a@example.com",
  message: "Hello",
});

const baseConfig: RequestConfig = {
  transport: "auto",
  http: { provider: "web3forms", endpoint: null, accessKey: null },
  recipient: "owner@example.com",
  subjectPrefix: "Website request",
  limits: { name: 60, email: 120, message: 1000 },
  draftKey: "dp.request-draft",
};

describe("MailtoGateway", () => {
  it("builds a mailto URL and reports the recipient", async () => {
    const navigate = vi.fn();
    const gateway = new MailtoGateway({
      recipient: "owner@example.com",
      subjectPrefix: "Website request",
      navigate,
    });
    expect(gateway.kind).toBe("mailto");
    const url = gateway.buildUrl(payload);
    expect(url).toContain("mailto:owner@example.com?subject=");
    expect(url).toContain("body=");
    expect(await gateway.send(payload)).toEqual({
      ok: true,
      messageKey: "form.result.mailto",
      vars: { recipient: "owner@example.com" },
    });
    expect(navigate).toHaveBeenCalledWith(url);
  });
});

describe("HttpGateway", () => {
  it("posts JSON and reports delivery", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const gateway = new HttpGateway({
      provider: "custom",
      endpoint: "https://example.invalid/submit",
      subjectPrefix: "Website request",
      fetchImpl,
    });
    expect(gateway.kind).toBe("http");
    const result = await gateway.send(payload);
    expect(result).toEqual({ ok: true, messageKey: "form.result.delivered" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.invalid/submit",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reports failure without throwing", async () => {
    const gateway = new HttpGateway({
      endpoint: "https://example.invalid/submit",
      subjectPrefix: "Website request",
      fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    });
    expect(await gateway.send(payload)).toEqual({ ok: false, messageKey: "form.result.failed" });
  });

  it("requires an endpoint", () => {
    expect(() => new HttpGateway({ subjectPrefix: "Website request" })).toThrow(
      "requires an endpoint",
    );
  });
});

describe("createGateway", () => {
  it("chooses mailto by default and http when configured", () => {
    expect(createGateway(baseConfig).kind).toBe("mailto");
    expect(
      createGateway({
        ...baseConfig,
        transport: "mailto",
        http: { ...baseConfig.http, accessKey: "key" },
      }).kind,
    ).toBe("mailto");
    expect(
      createGateway({ ...baseConfig, http: { ...baseConfig.http, accessKey: "key" } }).kind,
    ).toBe("http");
    expect(
      createGateway({
        ...baseConfig,
        http: { ...baseConfig.http, endpoint: "https://form.invalid" },
      }).kind,
    ).toBe("http");
    expect(
      createGateway({
        ...baseConfig,
        transport: "http",
        http: { ...baseConfig.http, endpoint: "https://form.invalid" },
      }).kind,
    ).toBe("http");
  });
});
