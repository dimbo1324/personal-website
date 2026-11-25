import { spawnSync } from "node:child_process";
import type { Workspace } from "./Workspace.ts";

const MAX_BUFFER = 64 * 1024 * 1024;

export class Shell {
  readonly #workspace: Workspace;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
  }

  run(command: string, args: readonly string[] = []): void {
    const result = this.#spawn(command, args);

    if (result.stdout) {
      this.#workspace.log(result.stdout.trimEnd());
    }

    if (result.stderr) {
      this.#workspace.warn(result.stderr.trimEnd());
    }

    if (result.status !== 0) {
      throw new Error(`${command} ${args.join(" ")} exited with code ${result.status ?? "null"}`);
    }
  }

  capture(command: string, args: readonly string[] = []): string {
    const result = this.#spawn(command, args);

    if (result.status !== 0) {
      throw new Error(`${command} ${args.join(" ")} failed: ${result.stderr.trim()}`);
    }

    return result.stdout;
  }

  static isAvailable(command: string): boolean {
    const probe = process.platform === "win32" ? "where" : "which";

    return spawnSync(probe, [command], { stdio: "ignore", shell: false }).status === 0;
  }

  #spawn(command: string, args: readonly string[]) {
    const options = {
      cwd: this.#workspace.root,
      encoding: "utf8" as const,
      maxBuffer: MAX_BUFFER,
    };

    if (process.platform === "win32") {
      const line = [command, ...args.map(Shell.#quote)].join(" ");

      return spawnSync(line, { ...options, shell: true });
    }

    return spawnSync(command, [...args], options);
  }

  static #quote(argument: string): string {
    return /[\s"&|<>^]/.test(argument) ? `"${argument.replace(/"/g, '\\"')}"` : argument;
  }
}
