import { describe, expect, it, vi } from "vitest";
import { TelegramNotifier } from "../functions/lib/telegram";
import type { FetchLike } from "../functions/lib/types";

const lead = {
  name: "Dmitrii Prikhodko",
  contact: "a@example.com",
  message: "Need a SCADA engineer",
  turnstileToken: "token",
};
const input = {
  botToken: "bot-secret",
  chatId: "12345",
  lead,
  receivedAtIso: "2026-11-25T03:00:00.000Z",
};
const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("TelegramNotifier", () => {
  it("does not call the network without credentials", async () => {
    const fetchImpl = vi.fn() as unknown as FetchLike;
    const result = await new TelegramNotifier(fetchImpl).sendLead({ ...input, botToken: " " });
    expect(result).toEqual({ ok: false, reason: "telegram_not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("delivers the lead with the expected payload", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json({ ok: true })) as unknown as FetchLike;
    const result = await new TelegramNotifier(fetchImpl).sendLead(input);
    expect(result).toEqual({ ok: true, mode: "telegram" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.telegram.org/botbot-secret/sendMessage",
      expect.objectContaining({ method: "POST" }),
    );
    const init = vi.mocked(fetchImpl).mock.calls[0]?.[1];
    const body = JSON.parse(String(init?.body)) as {
      chat_id: string;
      text: string;
      disable_web_page_preview: boolean;
    };
    expect(body.chat_id).toBe("12345");
    expect(body.disable_web_page_preview).toBe(true);
    expect(body.text).toContain("Name: Dmitrii Prikhodko");
    expect(body.text).toContain("Contact: a@example.com");
    expect(body.text).toContain("Need a SCADA engineer");
  });

  it("fails closed on rejection, upstream errors and network failures", async () => {
    const rejected = vi.fn().mockResolvedValue(json({ ok: false }));
    expect(await new TelegramNotifier(rejected as unknown as FetchLike).sendLead(input)).toEqual({
      ok: false,
      reason: "telegram_rejected",
    });

    const upstream = vi.fn().mockResolvedValue(json({}, 500));
    expect(await new TelegramNotifier(upstream as unknown as FetchLike).sendLead(input)).toEqual({
      ok: false,
      reason: "telegram_upstream_error",
    });

    const network = vi.fn().mockRejectedValue(new Error("offline"));
    expect(await new TelegramNotifier(network as unknown as FetchLike).sendLead(input)).toEqual({
      ok: false,
      reason: "telegram_network_error",
    });
  });
});
