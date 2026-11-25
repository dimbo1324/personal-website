import { describe, expect, it } from "vitest";
import { formatTime } from "../src/scripts/site/features/theater/formatTime";

describe("formatTime", () => {
  it("formats seconds as m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(75.4)).toBe("1:15");
    expect(formatTime(605)).toBe("10:05");
  });

  it("returns a safe value for invalid input", () => {
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(-3)).toBe("0:00");
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});
