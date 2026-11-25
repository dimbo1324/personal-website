import { describe, expect, it } from "vitest";
import { LeadApiHandler } from "../functions/lib/leadHandler";
import type { FetchLike, LeadEnv } from "../functions/lib/types";

const BODY = {
  name: "Alex Rivera",
  contact: "alex@example.com",
  message: "Interested in industrial automation consulting.",
  turnstileToken: "valid-token",
};

const ENV: LeadEnv = {
  TURNSTILE_SECRET_KEY: "test-turnstile-secret",
  TELEGRAM_BOT_TOKEN: "test-telegram-token",
  TELEGRAM_CHAT_ID: "-1001234567890",
  ALLOWED_ORIGIN: "https://example.test",
};

function makeRequest(body: unknown, origin = "https://example.test"): Request {
  return new Request("https://example.test/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}

function routed(turnstile: Response, telegram: Response | null): FetchLike {
  return async (input) => {
    const url = String(input);

    if (url.includes("siteverify")) {
      return turnstile;
    }

    if (url.includes("api.telegram.org") && telegram) {
      return telegram;
    }

    throw new Error(`unexpected call: ${url}`);
  };
}

const json = (value: unknown, status = 200): Response =>
  new Response(JSON.stringify(value), { status });

describe("LeadApiHandler", () => {
  it("verifies Turnstile and delivers the lead to Telegram", async () => {
    const handler = new LeadApiHandler(
      { now: () => new Date("2026-11-24T12:00:00.000Z") },
      routed(json({ success: true }), json({ ok: true })),
    );
    const response = await handler.handle(makeRequest(BODY), ENV);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true, delivery: "telegram" });
  });

  it("uses the stub notifier in explicit demo mode without calling Telegram", async () => {
    const calls: string[] = [];
    const handler = new LeadApiHandler({}, async (input) => {
      calls.push(String(input));
      return json({ success: true });
    });
    const response = await handler.handle(makeRequest(BODY), {
      ...ENV,
      LEAD_DELIVERY_MODE: "stub",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, delivery: "stub" });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("siteverify");
  });

  it("fails closed when Telegram is not configured", async () => {
    const handler = new LeadApiHandler({}, routed(json({ success: true }), null));
    const response = await handler.handle(makeRequest(BODY), {
      ...ENV,
      TELEGRAM_BOT_TOKEN: "",
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "telegram_not_configured" });
  });

  it("rejects a foreign Origin before any outbound call", async () => {
    const handler = new LeadApiHandler({}, async () => {
      throw new Error("must not be called");
    });
    const response = await handler.handle(makeRequest(BODY, "https://evil.invalid"), ENV);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "origin_not_allowed" });
  });

  it("fails closed when Turnstile rejects the token", async () => {
    const handler = new LeadApiHandler({}, routed(json({ success: false }), null));
    const response = await handler.handle(makeRequest(BODY), ENV);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "turnstile_rejected" });
  });

  it("fails closed when the Turnstile secret is missing", async () => {
    const handler = new LeadApiHandler({}, async () => {
      throw new Error("must not be called");
    });
    const response = await handler.handle(makeRequest(BODY), { ...ENV, TURNSTILE_SECRET_KEY: "" });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: "turnstile_not_configured" });
  });

  it("reports a Telegram failure as 502 and never as success", async () => {
    const handler = new LeadApiHandler(
      {},
      routed(json({ success: true }), new Response("boom", { status: 500 })),
    );
    const response = await handler.handle(makeRequest(BODY), ENV);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: "telegram_upstream_error" });
  });

  it("rejects non-JSON bodies", async () => {
    const handler = new LeadApiHandler({}, async () => {
      throw new Error("must not be called");
    });
    const request = new Request("https://example.test/api/lead", {
      method: "POST",
      headers: { "content-type": "text/plain", origin: "https://example.test" },
      body: "x",
    });
    const response = await handler.handle(request, ENV);

    expect(response.status).toBe(415);
  });
});
