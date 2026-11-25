import { describe, expect, it } from "vitest";
import { CONTACT } from "../src/scripts/site/data/contact";
import {
  e164,
  formatPhone,
  telHref,
  whatsAppHref,
} from "../src/scripts/site/features/contact/phoneNumber";

describe("phone number helpers", () => {
  it("formats the on-demand phone number", () => {
    expect(formatPhone(CONTACT.phone)).toBe("+598 96 671 725");
    expect(e164(CONTACT.phone)).toBe("+59896671725");
  });

  it("builds tel: and wa.me links without a plus sign", () => {
    expect(telHref(CONTACT.phone)).toBe("tel:+59896671725");
    expect(whatsAppHref(CONTACT.phone)).toBe("https://wa.me/59896671725");
  });

  it("handles custom groups", () => {
    const phone = { country: "1", groups: ["415", "555", "0100"] };
    expect(formatPhone(phone)).toBe("+1 415 555 0100");
    expect(e164(phone)).toBe("+14155550100");
  });
});
