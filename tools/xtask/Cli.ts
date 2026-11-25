import { readFileSync } from "node:fs";
import { AgentSync } from "./AgentSync.ts";
import { CommitMessage } from "./CommitMessage.ts";
import { Doctor } from "./Doctor.ts";
import { Formatter } from "./Formatter.ts";
import { Gate } from "./Gate.ts";
import { Shell } from "./Shell.ts";
import { Workspace } from "./Workspace.ts";

const USAGE = `usage: npm run xtask -- <command>

  gate [--quick]         quality gate (quick: rules, format, entry points, clean, eslint)
  fmt [--check|--staged] format with Prettier
  lint                   ESLint
  typecheck              astro check + functions type check
  test                   Vitest unit tests
  build                  astro build
  sync-agents [--check]  regenerate AGENTS.md and .codex/ from .ai/ and .claude/
  install-hooks          point git at .githooks/
  commit-msg <file>      validate a commit message (used by the hook)
  doctor                 read-only toolchain diagnostics`;

export class Cli {
  static run(argv: readonly string[]): number {
    const [command, ...rest] = argv;
    const workspace = new Workspace();

    try {
      Cli.#dispatch(workspace, command, rest);

      return 0;
    } catch (error) {
      workspace.warn(error instanceof Error ? error.message : String(error));

      return 1;
    }
  }

  static #dispatch(workspace: Workspace, command: string | undefined, rest: readonly string[]) {
    const gate = new Gate(workspace);

    switch (command) {
      case "gate":
        return gate.run(rest.includes("--quick"));
      case "fmt":
        return rest.includes("--staged")
          ? new Formatter(workspace).staged()
          : new Formatter(workspace).run(rest.includes("--check"));
      case "lint":
        return gate.execute([["eslint", () => gate.lint()]], false);
      case "typecheck":
        return gate.execute([["typecheck", () => gate.typecheck()]], false);
      case "test":
        return gate.execute([["unit tests", () => gate.test()]], false);
      case "build":
        return gate.execute([["astro build", () => gate.build()]], false);
      case "sync-agents":
        return new AgentSync(workspace).run(rest.includes("--check"));
      case "install-hooks":
        return new Shell(workspace).run("git", ["config", "core.hooksPath", ".githooks"]);
      case "commit-msg":
        return Cli.#commitMessage(rest[0]);
      case "doctor":
        return new Doctor(workspace).run();
      default:
        throw new Error(USAGE);
    }
  }

  static #commitMessage(path: string | undefined): void {
    if (!path) {
      throw new Error("usage: npm run xtask -- commit-msg <message file>");
    }

    CommitMessage.check(readFileSync(path, "utf8"));
  }
}
