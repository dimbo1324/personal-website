import { contactFormSchema } from "./contact";

describe("contactFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello, I would like to get in touch.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "not-an-email",
      message: "Hello, I would like to get in touch.",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = contactFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "hi",
    });

    expect(result.success).toBe(false);
  });
});
