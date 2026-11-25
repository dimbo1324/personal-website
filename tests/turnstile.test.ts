import { describe, expect, it, vi } from "vitest";
import { TurnstileVerifier } from "../functions/lib/turnstile";
import type { FetchLike } from "../functions/lib/types";

const input = { secretKey: "secret", token: "token", remoteIp: "1.2.3.4" };
const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("TurnstileVerifier", () => {
  it("does not call the network without a secret", async () => {
    const fetchImpl = vi.fn() as unknown as FetchLike;
    const result = await new TurnstileVerifier(fetchImpl).verify({ ...input, secretKey: "  " });
    expect(result).toEqual({ ok: false, reason: "turnstile_not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("accepts a verified token and sends the expected form body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json({ success: true })) as unknown as FetchLike;
    const result = await new TurnstileVerifier(fetchImpl).verify(input);
    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
    const init = vi.mocked(fetchImpl).mock.calls[0]?.[1];
    const body = new URLSearchParams(String(init?.body));
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("token");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("rejects unverified tokens, upstream errors and network failures", async () => {
    const rejected = vi
      .fn()
      .mockResolvedValue(json({ success: false, "error-codes": ["timeout-or-duplicate"] }));
    expect(await new TurnstileVerifier(rejected as unknown as FetchLike).verify(input)).toEqual({
      ok: false,
      reason: "turnstile_rejected",
    });

    const upstream = vi.fn().mockResolvedValue(json({}, 503));
    expect(await new TurnstileVerifier(upstream as unknown as FetchLike).verify(input)).toEqual({
      ok: false,
      reason: "turnstile_upstream_error",
    });

    const network = vi.fn().mockRejectedValue(new Error("offline"));
    expect(await new TurnstileVerifier(network as unknown as FetchLike).verify(input)).toEqual({
      ok: false,
      reason: "turnstile_network_error",
    });
  });
});
