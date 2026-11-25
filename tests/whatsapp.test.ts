import { describe, expect, it } from "vitest";
import { WhatsAppLinkBuilder } from "../src/lib/whatsapp";

describe("WhatsAppLinkBuilder", () => {
  const builder = new WhatsAppLinkBuilder();

  it("builds a clean wa.me link with an encoded message", () => {
    const url = builder.build({
      phone: "+598 99 123 456",
      message: "Hello! PLC & IIoT?",
    });

    expect(url).toBe("https://wa.me/59899123456?text=Hello!%20PLC%20%26%20IIoT%3F");
  });

  it("omits the query string when the message is blank", () => {
    expect(builder.build({ phone: "59899123456", message: "   " })).toBe(
      "https://wa.me/59899123456",
    );
  });

  it("returns null for empty or out-of-range phone numbers", () => {
    expect(builder.build({ phone: "" })).toBeNull();
    expect(builder.build({ phone: "12345" })).toBeNull();
    expect(builder.build({ phone: "12345678901234567" })).toBeNull();
  });
});
