#!/usr/bin/env node
/**
 * Cross-platform workspace cleaner.
 *   pnpm clean            remove build output + caches
 *   pnpm clean --all      also remove every node_modules directory
 * Pure Node (no rimraf/del dependency).
 */
import { rm, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ALL = process.argv.includes("--all");

const ARTIFACTS = new Set([
  ".next",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage",
  ...(ALL ? ["node_modules"] : []),
]);

const SKIP = new Set([".git", ".pnpm-store", ...(ALL ? [] : ["node_modules"])]);

let removed = 0;

/** @param {string} dir */
async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const full = join(dir, entry.name);
    if (ARTIFACTS.has(entry.name)) {
      await rm(full, { recursive: true, force: true });
      console.log(`  removed  ${relative(ROOT, full) || entry.name}`);
      removed += 1;
      continue;
    }
    if (SKIP.has(entry.name)) continue;
    await walk(full);
  }
}

console.log(ALL ? "Cleaning build output and node_modules…" : "Cleaning build output…");
await walk(ROOT);
console.log(
  removed === 0
    ? "Nothing to clean."
    : `Done — ${removed} director${removed === 1 ? "y" : "ies"} removed.`,
);
