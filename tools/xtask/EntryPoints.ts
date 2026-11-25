import { readFileSync } from "node:fs";
import { Shell } from "./Shell.ts";
import type { Workspace } from "./Workspace.ts";

const MAX_CODE_LINES = 15;
const MARKER = ["-----------", "entry point", "-----------"];
const PAGES_FUNCTION_ENTRY = /^functions\/api\/.+\.ts$/;
const EXEMPT_PREFIXES = ["docs/__arch__/reference/"];

export type EntryFinding = "missing_marker" | `too_many_lines:${number}`;

export class EntryPoints {
  readonly #workspace: Workspace;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
  }

  static isEntryPoint(path: string, content: string): boolean {
    if (EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return false;
    }

    return (
      content.startsWith("#!") || path === "tools/xtask/main.ts" || PAGES_FUNCTION_ENTRY.test(path)
    );
  }

  static inspect(content: string): { codeLines: number; findings: EntryFinding[] } {
    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const shebang = lines[0]?.startsWith("#!") ?? false;
    const comment = shebang ? "#" : "//";

    if (shebang) {
      lines.shift();
    }

    const findings: EntryFinding[] = [];
    const markerPresent = MARKER.every(
      (text, index) => lines[index]?.trimEnd() === `${comment} ${text}`,
    );

    if (!markerPresent) {
      findings.push("missing_marker");
    }

    const codeLines = EntryPoints.#countCode(lines);

    if (codeLines > MAX_CODE_LINES) {
      findings.push(`too_many_lines:${codeLines}`);
    }

    return { codeLines, findings };
  }

  check(): void {
    const shell = new Shell(this.#workspace);
    const listing = shell.capture("git", ["ls-files"]);
    const failures: string[] = [];
    let found = 0;

    for (const path of listing.split("\n").filter((line) => line.length > 0)) {
      const content = this.#read(path);

      if (content === null || !EntryPoints.isEntryPoint(path, content)) {
        continue;
      }

      const { codeLines, findings } = EntryPoints.inspect(content);

      found += 1;
      this.#workspace.log(`entry point ${path}: ${codeLines} line(s) of code`);
      failures.push(...findings.map((finding) => `${path}: ${finding}`));
    }

    this.#workspace.log(`${found} entry point(s) checked`);

    if (failures.length > 0) {
      throw new Error(`entry point rule violations:\n  ${failures.join("\n  ")}`);
    }
  }

  #read(path: string): string | null {
    try {
      return readFileSync(this.#workspace.path(path), "utf8");
    } catch {
      return null;
    }
  }

  static #countCode(lines: readonly string[]): number {
    return lines
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          !line.startsWith("//") &&
          !line.startsWith("#") &&
          !line.startsWith("import ") &&
          !/^[})\];,]+$/.test(line),
      ).length;
  }
}
