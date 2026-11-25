import { Shell } from "./Shell.ts";
import type { Workspace } from "./Workspace.ts";

const ALLOWED_PREFIXES = [
  "out/",
  "dist/",
  "node_modules/",
  ".astro/",
  ".wrangler/",
  "coverage/",
  ".claude/settings.local.json",
  ".claude/worktrees/",
  ".env",
  ".dev.vars",
];

export class CleanSafe {
  readonly #workspace: Workspace;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
  }

  static irreplaceable(listing: string): string[] {
    return listing
      .split("\n")
      .map((line) => line.trim())
      .filter((path) => path.length > 0)
      .filter((path) => !path.includes("__pycache__/"))
      .filter((path) => !ALLOWED_PREFIXES.some((allowed) => path.startsWith(allowed)));
  }

  check(): void {
    const listing = new Shell(this.#workspace).capture("git", [
      "ls-files",
      "--others",
      "--ignored",
      "--exclude-standard",
      "--directory",
    ]);
    const lost = CleanSafe.irreplaceable(listing);

    this.#workspace.log(`ignored paths outside the allowed list: ${lost.length}`);

    if (lost.length > 0) {
      throw new Error(
        `these files are ignored by git, so \`git clean -fdX\` would delete them; track them or ` +
          `add a build result to ALLOWED_PREFIXES in tools/xtask/CleanSafe.ts:\n  ${lost.join("\n  ")}`,
      );
    }
  }
}
