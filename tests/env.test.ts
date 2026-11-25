import { describe, expect, it } from "vitest";
import { resolveLeadMode } from "../src/scripts/site/config/env";

describe("resolveLeadMode", () => {
  it("enables demo only for an explicit demo value", () => {
    expect(resolveLeadMode("demo")).toBe("demo");
    expect(resolveLeadMode(" DEMO ")).toBe("demo");
    expect(resolveLeadMode("live")).toBe("live");
    expect(resolveLeadMode("")).toBe("live");
    expect(resolveLeadMode(undefined)).toBe("live");
    expect(resolveLeadMode("demo-mode")).toBe("live");
  });
});
