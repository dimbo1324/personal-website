import { mkdirSync, appendFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export class Workspace {
  readonly #root: string;
  readonly #logFile: string;

  constructor(root: string = resolve(import.meta.dirname, "..", "..")) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");

    this.#root = root;
    this.#logFile = join(root, "out", "logs", "xtask", `${stamp}.log`);
    mkdirSync(dirname(this.#logFile), { recursive: true });
  }

  get root(): string {
    return this.#root;
  }

  path(...parts: string[]): string {
    return join(this.#root, ...parts);
  }

  static now(): string {
    return new Date().toISOString();
  }

  static isCi(): boolean {
    return process.env["CI"] === "true";
  }

  log(message: string): void {
    process.stdout.write(`${message}\n`);
    appendFileSync(this.#logFile, `${message}\n`);
  }

  warn(message: string): void {
    process.stderr.write(`${message}\n`);
    appendFileSync(this.#logFile, `${message}\n`);
  }
}
