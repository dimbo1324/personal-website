/* eslint-disable no-console -- the single browser logging boundary */

type LogLevel = "warn" | "error";

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function report(level: LogLevel, scope: string, error: unknown): void {
  console[level](`[${scope}] ${describe(error)}`);
}

export function reportError(scope: string, error: unknown): void {
  report("error", scope, error);
}

export function reportWarning(scope: string, error: unknown): void {
  report("warn", scope, error);
}
