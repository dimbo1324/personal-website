import { describe, expect, it, vi } from "vitest";
import { StubLeadNotifier, createLeadNotifier } from "../functions/lib/notifier";
import { TelegramNotifier } from "../functions/lib/telegram";
import type { LeadDeliveryInput } from "../functions/lib/notifier";
import type { FetchLike } from "../functions/lib/types";

const input: LeadDeliveryInput = {
  botToken: "token",
  chatId: "123",
  lead: {
    name: "Alex Rivera",
    contact: "alex@example.com",
    message: "Interested in a SCADA project.",
    turnstileToken: "token",
  },
  receivedAtIso: "2026-11-25T00:00:00.000Z",
};

describe("StubLeadNotifier", () => {
  it("acknowledges without a network call and keeps only a counter", async () => {
    const notifier = new StubLeadNotifier();
    expect(notifier.mode).toBe("stub");
    expect(notifier.received).toBe(0);

    await expect(notifier.sendLead(input)).resolves.toEqual({ ok: true, mode: "stub" });
    await notifier.sendLead(input);
    expect(notifier.received).toBe(2);
  });
});

describe("createLeadNotifier", () => {
  it("selects the stub only with the explicit delivery mode", () => {
    const fetchImpl = vi.fn() as unknown as FetchLike;

    expect(createLeadNotifier({ LEAD_DELIVERY_MODE: "stub" }, fetchImpl)).toBeInstanceOf(
      StubLeadNotifier,
    );
    expect(createLeadNotifier({}, fetchImpl)).toBeInstanceOf(TelegramNotifier);
    expect(createLeadNotifier({ LEAD_DELIVERY_MODE: "STUB" }, fetchImpl)).toBeInstanceOf(
      TelegramNotifier,
    );
    expect(createLeadNotifier({ LEAD_DELIVERY_MODE: "typo" }, fetchImpl)).toBeInstanceOf(
      TelegramNotifier,
    );
  });
});
