import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("applies defaults when nothing is set", () => {
    const env = parseEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("parses provided values", () => {
    const env = parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://example.com" });
    expect(env.NODE_ENV).toBe("production");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("throws on an invalid NODE_ENV", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow();
  });
});
