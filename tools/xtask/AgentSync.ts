import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Workspace } from "./Workspace.ts";

const BUDGET_BYTES = 30 * 1024;
const TIER_MARKER = "<!-- tier: extended -->";
const ESSENCE_PREFIX = "> **Essence.**";
const GROUPS = ["universal", "project"];
const PROJECT_NAME = "Personal Website";

const BANNER = `<!--
GENERATED FILE - DO NOT EDIT.
Source of truth: .ai/universal/*.md and .ai/project/*.md.
Edit a module, then run: npm run sync-agents
-->

# ${PROJECT_NAME} - working notes for Codex, Gemini and other AI assistants

This file is assembled from the shared rule modules in \`.ai/\`, so every assistant follows
identical rules. Later sections override earlier ones; an explicit owner instruction in the
current conversation overrides everything. Start every task with the orientation ritual in
the progress-tracking module.`;

const EXTENDED_HEADER = `<!-- module index: extended -->

# Modules loaded on demand

These rules bind exactly like the inlined ones; only their full text lives outside this
file, to stay within the instruction budget. Read the file itself when a task touches it -
that is an obligation, not a suggestion.`;

interface Module {
  readonly path: string;
  readonly body: string;
}

interface AgentDefinition {
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
}

export class AgentSync {
  readonly #workspace: Workspace;

  constructor(workspace: Workspace) {
    this.#workspace = workspace;
  }

  static isExtended(module: Module): boolean {
    return module.body
      .split("\n")
      .slice(0, 5)
      .some((line) => line.trim() === TIER_MARKER);
  }

  static essence(module: Module): string {
    const line = module.body.split("\n").find((candidate) => candidate.startsWith(ESSENCE_PREFIX));

    if (!line) {
      throw new Error(`${module.path} is extended-tier but has no \`${ESSENCE_PREFIX}\` line`);
    }

    return line.slice(ESSENCE_PREFIX.length).trim();
  }

  static parseAgent(path: string, text: string): AgentDefinition {
    const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);

    if (!match) {
      throw new Error(`${path} must start with YAML front matter`);
    }

    const fields = new Map<string, string>();

    for (const line of (match[1] ?? "").split("\n")) {
      const index = line.indexOf(":");

      if (index > 0) {
        fields.set(line.slice(0, index).trim(), line.slice(index + 1).trim());
      }
    }

    const field = (key: string): string => {
      const value = fields.get(key);

      if (!value) {
        throw new Error(`${path} front matter lacks \`${key}\``);
      }

      return value;
    };

    return {
      name: field("name"),
      description: field("description"),
      instructions: (match[2] ?? "").trim(),
    };
  }

  static toCodexToml(agent: AgentDefinition): string {
    if (agent.instructions.includes("'''")) {
      throw new Error(`agent \`${agent.name}\` instructions must not contain '''`);
    }

    const quote = (value: string): string =>
      `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

    return (
      `# GENERATED from .claude/agents/${agent.name}.md by \`npm run sync-agents\`. Do not edit.\n` +
      `name = ${quote(agent.name)}\n` +
      `description = ${quote(agent.description)}\n` +
      `developer_instructions = '''\n${agent.instructions}\n'''\n`
    );
  }

  run(check: boolean): void {
    const expected = new Map<string, string>();

    expected.set("AGENTS.md", this.#assembleAgentsMd());
    this.#mirrorAgents(expected);
    this.#mirrorSkills(expected);

    const stale = this.#stale(expected);

    if (check) {
      this.#verify(expected, stale);
      return;
    }

    for (const [relative, content] of expected) {
      const path = this.#workspace.path(relative);
      const current = existsSync(path) ? readFileSync(path, "utf8") : null;

      if (current !== content) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, content);
        this.#workspace.log(`generated ${relative}`);
      }
    }

    for (const relative of stale) {
      rmSync(this.#workspace.path(relative));
      this.#workspace.log(`removed stale ${relative}`);
    }

    this.#workspace.log("assistant rules are in sync");
  }

  #verify(expected: Map<string, string>, stale: readonly string[]): void {
    const drift: string[] = [];

    for (const [relative, content] of expected) {
      const path = this.#workspace.path(relative);
      const actual = existsSync(path) ? readFileSync(path, "utf8").replace(/\r\n/g, "\n") : null;

      if (actual !== content) {
        drift.push(relative);
      }
    }

    drift.push(...stale.map((path) => `${path} (stale)`));

    if (drift.length > 0) {
      throw new Error(
        `generated assistant files are out of date: ${drift.join(", ")}; run \`npm run sync-agents\``,
      );
    }

    this.#workspace.log("assistant rules are in sync");
  }

  #assembleAgentsMd(): string {
    const sections = [BANNER];
    const extended: string[] = [];

    for (const module of this.#modules()) {
      if (AgentSync.isExtended(module)) {
        const title = module.body.split("\n").find((line) => line.startsWith("# "));

        extended.push(
          `## ${title?.slice(2).trim() ?? "(untitled module)"}\n\nFile: \`${module.path}\`\n\n${AgentSync.essence(module)}`,
        );
      } else {
        sections.push(`<!-- module: ${module.path} -->\n\n${module.body.trim()}`);
      }
    }

    if (extended.length > 0) {
      sections.push(`${EXTENDED_HEADER}\n\n${extended.join("\n\n")}`);
    }

    const document = `${sections.join("\n\n---\n\n")}\n`;
    const size = Buffer.byteLength(document);

    if (size > BUDGET_BYTES) {
      throw new Error(
        `AGENTS.md would be ${size} bytes, over the ${BUDGET_BYTES}-byte budget; move a module to the extended tier`,
      );
    }

    return document;
  }

  #modules(): Module[] {
    const modules: Module[] = [];

    for (const group of GROUPS) {
      const directory = this.#workspace.path(".ai", group);
      const names = readdirSync(directory)
        .filter((name) => name.endsWith(".md"))
        .sort();

      for (const name of names) {
        modules.push({
          path: `.ai/${group}/${name}`,
          body: AgentSync.#read(join(directory, name)),
        });
      }
    }

    return modules;
  }

  #mirrorAgents(expected: Map<string, string>): void {
    const directory = this.#workspace.path(".claude", "agents");

    if (!existsSync(directory)) {
      return;
    }

    for (const name of readdirSync(directory).filter((file) => file.endsWith(".md"))) {
      const agent = AgentSync.parseAgent(name, AgentSync.#read(join(directory, name)));

      expected.set(`.codex/agents/${agent.name}.toml`, AgentSync.toCodexToml(agent));
    }
  }

  #mirrorSkills(expected: Map<string, string>): void {
    const directory = this.#workspace.path(".claude", "skills");

    if (!existsSync(directory)) {
      return;
    }

    for (const name of readdirSync(directory)) {
      const source = join(directory, name, "SKILL.md");

      if (existsSync(source)) {
        expected.set(`.codex/skills/${name}/SKILL.md`, AgentSync.#read(source));
      }
    }
  }

  #stale(expected: Map<string, string>): string[] {
    const stale: string[] = [];
    const agents = this.#workspace.path(".codex", "agents");

    if (existsSync(agents)) {
      for (const name of readdirSync(agents).filter((file) => file.endsWith(".toml"))) {
        if (!expected.has(`.codex/agents/${name}`)) {
          stale.push(`.codex/agents/${name}`);
        }
      }
    }

    const skills = this.#workspace.path(".codex", "skills");

    if (existsSync(skills)) {
      for (const name of readdirSync(skills)) {
        const relative = `.codex/skills/${name}/SKILL.md`;

        if (existsSync(this.#workspace.path(relative)) && !expected.has(relative)) {
          stale.push(relative);
        }
      }
    }

    return stale;
  }

  static #read(path: string): string {
    return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  }
}
