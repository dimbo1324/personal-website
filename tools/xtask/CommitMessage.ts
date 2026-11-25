const TYPES = [
  "feat",
  "fix",
  "refactor",
  "perf",
  "test",
  "docs",
  "build",
  "ci",
  "chore",
  "security",
  "revert",
];
const FORBIDDEN_SUBJECTS = ["fix", "update", "wip", "changes", "final", "misc", "123"];
const MAX_SUBJECT_LENGTH = 72;

export class CommitMessage {
  static check(message: string): void {
    const subject = message
      .split("\n")
      .find((line) => line.trim().length > 0 && !line.startsWith("#"))
      ?.trim();

    if (!subject) {
      throw new Error("commit message is empty");
    }

    if (subject.startsWith("Merge ") || subject.startsWith('Revert "')) {
      return;
    }

    const separator = subject.indexOf(": ");

    if (separator < 0) {
      throw new Error(`subject must look like \`type(scope): what and why\`, got \`${subject}\``);
    }

    const header = subject.slice(0, separator).replace(/!$/, "");
    const description = subject.slice(separator + 2).trim();
    const kind = header.split("(")[0] ?? "";

    if (!TYPES.includes(kind)) {
      throw new Error(`unknown commit type \`${kind}\`; allowed: ${TYPES.join(", ")}`);
    }

    if (header.includes("(") && !header.endsWith(")")) {
      throw new Error("scope must be closed: `type(scope): subject`");
    }

    if (description.length === 0 || FORBIDDEN_SUBJECTS.includes(description.toLowerCase())) {
      throw new Error(`subject \`${description}\` says nothing; describe what changed and why`);
    }

    if ([...subject].length > MAX_SUBJECT_LENGTH) {
      throw new Error(`subject is longer than ${MAX_SUBJECT_LENGTH} characters`);
    }
  }
}
