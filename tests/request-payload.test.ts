import { describe, expect, it } from "vitest";
import { RequestPayload } from "../src/scripts/site/features/request/RequestPayload";

const values = {
  lastName: "  Pri  khodko ",
  firstName: "Dmitrii",
  middleName: "  ",
  phone: "+598 96 671 725",
  email: "  DMITRII@Example.COM ",
  message: "  Need a SCADA engineer\nfor a live refinery.  ",
};

describe("RequestPayload", () => {
  it("normalises contact details", () => {
    const payload = new RequestPayload(values, {
      lang: "es",
      now: new Date("2026-11-25T03:00:00.000Z"),
    });
    expect(payload.lastName).toBe("Pri khodko");
    expect(payload.middleName).toBe("");
    expect(payload.email).toBe("dmitrii@example.com");
    expect(payload.lang).toBe("es");
    expect(Object.isFrozen(payload)).toBe(true);
  });

  it("builds the full name and the subject", () => {
    const payload = new RequestPayload({ ...values, middleName: "Ivanovich" });
    expect(payload.fullName).toBe("Pri khodko Dmitrii Ivanovich");
    expect(payload.subject("Website request")).toBe(
      "Website request — Pri khodko Dmitrii Ivanovich",
    );
  });

  it("renders plain text for the mail gateway", () => {
    const payload = new RequestPayload(values, { now: new Date("2026-11-25T03:00:00.000Z") });
    const text = payload.toPlainText();
    expect(text).toContain("Name: Pri khodko Dmitrii");
    expect(text).toContain("Phone: +598 96 671 725");
    expect(text).toContain("Email: dmitrii@example.com");
    expect(text).toContain("Language: EN");
    expect(text).toContain("Need a SCADA engineer\nfor a live refinery.");
    expect(text).toContain("2026-11-25T03:00:00.000Z");
  });

  it("serialises nulls for absent optional fields", () => {
    const payload = new RequestPayload({ ...values, middleName: "", phone: "", message: "" });
    const json = payload.toJSON();
    expect(json.middleName).toBeNull();
    expect(json.phone).toBeNull();
    expect(json.message).toBeNull();
    expect(json.email).toBe("dmitrii@example.com");
  });
});
