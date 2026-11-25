import { Shell } from "./Shell.ts";
import type { Workspace } from "./Workspace.ts";

const REQUIRED_NODE_MAJOR = 22;

export class Doctor {
  readonly #workspace: Workspace;
  readonly #shell: Shell;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
    this.#shell = new Shell(workspace);
  }

  run(): void {
    const problems: string[] = [];
    const major = Number(process.versions.node.split(".")[0]);

    this.#report("node", process.versions.node);

    if (major < REQUIRED_NODE_MAJOR) {
      problems.push(`Node.js ${REQUIRED_NODE_MAJOR}+ is required, found ${process.versions.node}`);
    }

    for (const [label, command, args] of [
      ["npm", "npm", ["--version"]],
      ["git", "git", ["--version"]],
      ["astro", "npx", ["--no-install", "astro", "--version"]],
      ["tailwindcss", "npx", ["--no-install", "tailwindcss", "--help"]],
      ["typescript", "npx", ["--no-install", "tsc", "--version"]],
      ["wrangler", "npx", ["--no-install", "wrangler", "--version"]],
      ["vitest", "npx", ["--no-install", "vitest", "--version"]],
      ["prettier", "npx", ["--no-install", "prettier", "--version"]],
      ["eslint", "npx", ["--no-install", "eslint", "--version"]],
    ] as const) {
      try {
        const output = this.#shell.capture(command, args).split("\n").find(Boolean) ?? "";

        this.#report(label, output.trim().slice(0, 60));
      } catch {
        problems.push(`${label} is not available; run \`npm install\``);
      }
    }

    const hooks = this.#shell.capture("git", ["config", "--get", "core.hooksPath"]).trim();

    if (hooks !== ".githooks") {
      problems.push("git hooks are not installed; run `npm run xtask -- install-hooks`");
    }

    if (!Shell.isAvailable("gh")) {
      this.#workspace.warn("optional: GitHub CLI (gh) not found");
    }

    if (problems.length > 0) {
      throw new Error(`doctor found problems:\n  ${problems.join("\n  ")}`);
    }

    this.#workspace.log("doctor: everything required is present");
  }

  #report(label: string, value: string): void {
    this.#workspace.log(`${label.padEnd(12)} ${value}`);
  }
}
