import { mkdirSync, writeFileSync } from "node:fs";
import { AgentSync } from "./AgentSync.ts";
import { CleanSafe } from "./CleanSafe.ts";
import { EntryPoints } from "./EntryPoints.ts";
import { Formatter } from "./Formatter.ts";
import { Shell } from "./Shell.ts";
import { Workspace } from "./Workspace.ts";

interface StepOutcome {
  readonly name: string;
  readonly passed: boolean;
  readonly seconds: number;
  readonly error: string | null;
}

type Step = readonly [name: string, run: () => void];

export class Gate {
  readonly #workspace: Workspace;
  readonly #shell: Shell;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
    this.#shell = new Shell(workspace);
  }

  run(quick: boolean): void {
    const steps: Step[] = [
      ["agents in sync", () => new AgentSync(this.#workspace).run(true)],
      ["formatting", () => new Formatter(this.#workspace).run(true)],
      ["entry points", () => new EntryPoints(this.#workspace).check()],
      ["survives git clean", () => new CleanSafe(this.#workspace).check()],
      ["eslint", () => this.lint()],
    ];

    if (!quick) {
      steps.push(
        ["typecheck", () => this.typecheck()],
        ["unit tests", () => this.test()],
        ["astro build", () => this.build()],
      );
    }

    this.execute(steps, quick);
  }

  lint(): void {
    this.#shell.run("npx", ["--no-install", "eslint", "."]);
  }

  typecheck(): void {
    this.#shell.run("npx", ["--no-install", "astro", "check"]);
    this.#shell.run("npx", ["--no-install", "tsc", "-p", "functions/tsconfig.json"]);
  }

  test(): void {
    this.#shell.run("npx", ["--no-install", "vitest", "run"]);
  }

  build(): void {
    this.#shell.run("npx", ["--no-install", "astro", "build"]);
  }

  execute(steps: readonly Step[], quick: boolean): void {
    const outcomes: StepOutcome[] = [];

    for (const [name, step] of steps) {
      this.#workspace.log(`\n=== ${name} ===`);

      const started = Date.now();
      let error: string | null = null;

      try {
        step();
      } catch (caught) {
        error = caught instanceof Error ? caught.message : String(caught);
        this.#workspace.warn(`${name}: ${error}`);
      }

      outcomes.push({
        name,
        passed: error === null,
        seconds: Math.round((Date.now() - started) / 100) / 10,
        error,
      });
    }

    this.#summarize(outcomes, quick);
  }

  #summarize(outcomes: readonly StepOutcome[], quick: boolean): void {
    const passed = outcomes.every((outcome) => outcome.passed);

    this.#workspace.log("\n=== summary ===");

    for (const outcome of outcomes) {
      this.#workspace.log(
        `${outcome.passed ? "PASS" : "FAIL"}  ${outcome.seconds.toFixed(1).padStart(7)}s  ${outcome.name}`,
      );
    }

    mkdirSync(this.#workspace.path("out", "reports"), { recursive: true });
    writeFileSync(
      this.#workspace.path("out", "reports", "gate-latest.json"),
      JSON.stringify({ finishedAt: Workspace.now(), quick, passed, steps: outcomes }, null, 2),
    );

    if (!passed) {
      throw new Error("quality gate failed");
    }
  }
}
