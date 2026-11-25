import { describe, expect, it } from "vitest";
import {
  baseName,
  groupClipFiles,
  isMobileVariant,
} from "../src/scripts/site/features/media/catalog/clipFiles";
import { humanizeFileName } from "../src/scripts/site/features/media/catalog/humanizeFileName";

const config = { extensions: ["mp4", "webm"], posterExtensions: ["webp"] };

describe("clip file names", () => {
  it("strips mobile and file suffixes", () => {
    expect(baseName("02-keynote.mobile.mp4")).toBe("02-keynote");
    expect(baseName("02-keynote.mp4")).toBe("02-keynote");
    expect(isMobileVariant("02-keynote.mobile.mp4")).toBe(true);
    expect(isMobileVariant("02-keynote.mp4")).toBe(false);
  });

  it("groups main, mobile and poster files by base name", () => {
    const groups = groupClipFiles(
      [
        "02-keynote.webp",
        "01-intro.mp4",
        "02-keynote.mobile.mp4",
        "02-keynote.webm",
        "02-keynote.mp4",
      ],
      config,
    );
    expect(groups.map((group) => group.base)).toEqual(["01-intro", "02-keynote"]);
    expect(groups[1]?.main).toBe("02-keynote.mp4");
    expect(groups[1]?.mobile).toBe("02-keynote.mobile.mp4");
    expect(groups[1]?.poster).toBe("02-keynote.webp");
  });

  it("drops groups without a playable file and sorts numerically", () => {
    const groups = groupClipFiles(["10-b.mp4", "2-a.mp4", "orphan.webp"], config);
    expect(groups.map((group) => group.base)).toEqual(["2-a", "10-b"]);
  });

  it("humanises file names while keeping acronyms", () => {
    expect(humanizeFileName("02-iiot-architecture_keynote.mp4")).toBe("IIoT Architecture Keynote");
    expect(humanizeFileName("03-opc-ua_gateway.webm")).toBe("OPC UA Gateway");
    expect(humanizeFileName("01-plant.webp")).toBe("Plant");
  });
});
