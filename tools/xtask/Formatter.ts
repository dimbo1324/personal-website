import { Shell } from "./Shell.ts";
import type { Workspace } from "./Workspace.ts";

export class Formatter {
  readonly #workspace: Workspace;
  readonly #shell: Shell;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
    this.#shell = new Shell(workspace);
  }

  run(check: boolean): void {
    this.#shell.run("npx", ["--no-install", "prettier", check ? "--check" : "--write", "."]);
  }

  staged(): void {
    const staged = this.#lines(["diff", "--cached", "--name-only", "--diff-filter=ACM"]);
    const unstaged = new Set(this.#lines(["diff", "--name-only"]));
    const partial = staged.filter((file) => unstaged.has(file));
    const clean = staged.filter((file) => !unstaged.has(file));

    for (const file of partial) {
      this.#workspace.warn(`skipped partially staged file: ${file}`);
    }

    if (clean.length === 0) {
      return;
    }

    this.#shell.run("npx", [
      "--no-install",
      "prettier",
      "--write",
      "--ignore-unknown",
      "--no-error-on-unmatched-pattern",
      ...clean,
    ]);
    this.#shell.run("git", ["add", "--", ...clean]);
  }

  #lines(args: readonly string[]): string[] {
    return this.#shell
      .capture("git", args)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
