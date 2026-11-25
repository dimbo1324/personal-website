import { describe, expect, it } from "vitest";
import { WhatsAppChannel, WhatsAppLinkBuilder, resolveWhatsAppMode } from "../src/lib/whatsapp";

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

describe("resolveWhatsAppMode", () => {
  it("accepts real, stub and off and defaults anything else to auto", () => {
    expect(resolveWhatsAppMode("real")).toBe("real");
    expect(resolveWhatsAppMode(" Real ")).toBe("real");
    expect(resolveWhatsAppMode("STUB")).toBe("stub");
    expect(resolveWhatsAppMode("off")).toBe("off");
    expect(resolveWhatsAppMode("auto")).toBe("auto");
    expect(resolveWhatsAppMode(undefined)).toBe("auto");
    expect(resolveWhatsAppMode("typo")).toBe("auto");
  });
});

describe("WhatsAppChannel", () => {
  const channel = new WhatsAppChannel();

  it("builds a link in real and auto modes with a prefilled greeting", () => {
    expect(
      channel.resolve({
        phone: "+598 99 123 456",
        mode: "real",
        message: "Hello! PLC & IIoT?",
      }),
    ).toEqual({
      kind: "link",
      href: "https://wa.me/59899123456?text=Hello!%20PLC%20%26%20IIoT%3F",
    });

    expect(channel.resolve({ phone: "59899123456", mode: "auto" })).toEqual({
      kind: "link",
      href: "https://wa.me/59899123456",
    });
  });

  it("keeps an honest placeholder for stub and off modes", () => {
    expect(channel.resolve({ phone: "+598 99 123 456", mode: "stub" })).toEqual({
      kind: "placeholder",
      reason: "stub",
    });
    expect(channel.resolve({ phone: "+598 99 123 456", mode: "off" })).toEqual({
      kind: "placeholder",
      reason: "unconfigured",
    });
  });

  it("reports an unconfigured channel for invalid numbers and missing phones", () => {
    expect(channel.resolve({ phone: "12345", mode: "real" })).toEqual({
      kind: "placeholder",
      reason: "unconfigured",
    });
    expect(channel.resolve({ phone: null, mode: "auto" })).toEqual({
      kind: "placeholder",
      reason: "unconfigured",
    });
  });
});
