import { describe, expect, it } from "vitest";
import { CommitMessage } from "../tools/xtask/CommitMessage.ts";
import { CleanSafe } from "../tools/xtask/CleanSafe.ts";
import { EntryPoints } from "../tools/xtask/EntryPoints.ts";

describe("CommitMessage", () => {
  it("accepts conventional subjects", () => {
    for (const message of [
      "feat(contact): add Turnstile verification",
      "fix!: reject oversized payloads",
      "chore: bump toolchain\n\nBody text.",
      "Merge branch 'main' into feat/x",
    ]) {
      expect(() => CommitMessage.check(message), message).not.toThrow();
    }
  });

  it("rejects vague or malformed subjects", () => {
    for (const message of ["update", "feat: wip", "feature: add x", "feat(core: add x", ""]) {
      expect(() => CommitMessage.check(message), message).toThrow();
    }
  });
});

describe("EntryPoints", () => {
  const MARKER = "// -----------\n// entry point\n// -----------\n";

  it("accepts a thin marked entry file", () => {
    const { findings } = EntryPoints.inspect(`${MARKER}\nimport { x } from "./x";\n\nrun(x);\n`);

    expect(findings).toEqual([]);
  });

  it("flags a missing marker and a fat entry file", () => {
    const body = Array.from({ length: 20 }, (_, index) => `run(${index});`).join("\n");
    const { findings } = EntryPoints.inspect(body);

    expect(findings).toEqual(["missing_marker", "too_many_lines:20"]);
  });

  it("recognises Pages function entries and shebang files", () => {
    expect(EntryPoints.isEntryPoint("functions/api/lead.ts", "x")).toBe(true);
    expect(EntryPoints.isEntryPoint("functions/lib/leadHandler.ts", "x")).toBe(false);
    expect(EntryPoints.isEntryPoint(".githooks/pre-push", "#!/usr/bin/env bash\n")).toBe(true);
  });

  it("uses hash comments for shell entries and skips the archived reference", () => {
    const shell = "#!/usr/bin/env bash\n# -----------\n# entry point\n# -----------\nset -e\n";

    expect(EntryPoints.inspect(shell).findings).toEqual([]);
    expect(
      EntryPoints.isEntryPoint("docs/__arch__/reference/x/build.py", "#!/usr/bin/env python"),
    ).toBe(false);
  });
});

describe("CleanSafe", () => {
  it("allows results and personal files", () => {
    expect(CleanSafe.irreplaceable("out/\ndist/\nnode_modules/\n.astro/\n.env\n")).toEqual([]);
  });

  it("names a source folder hidden by an ignore rule", () => {
    expect(CleanSafe.irreplaceable("out/\nsrc/generated/\n")).toEqual(["src/generated/"]);
    expect(CleanSafe.irreplaceable("outer/\n")).toEqual(["outer/"]);
  });
});
