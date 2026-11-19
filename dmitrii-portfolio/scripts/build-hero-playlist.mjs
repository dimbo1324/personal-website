#!/usr/bin/env node
/**
 * Regenerates assets/video/hero/playlist.json from the files in the folder.
 *
 * Needed only for hosts that don't expose directory listings (GitHub Pages,
 * Netlify, …). Local dev servers list the folder, so new clips appear
 * without running anything. Existing titles/descriptions are preserved;
 * new files get a title derived from the file name.
 *
 * Usage:  node scripts/build-hero-playlist.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "assets", "video", "hero");
const MANIFEST = join(DIR, "playlist.json");
const EXTENSIONS = new Set([".mp4", ".webm", ".m4v", ".mov"]);

const humanize = (file) =>
  file
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || file;

const previous = await readFile(MANIFEST, "utf8")
  .then((text) => JSON.parse(text).videos ?? [])
  .catch(() => []);
const known = new Map(previous.map((entry) => [entry.file, entry]));

const files = (await readdir(DIR))
  .filter((name) => EXTENSIONS.has(extname(name).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

const videos = files.map((file) => known.get(file) ?? { file, title: humanize(file), description: "" });
await writeFile(MANIFEST, `${JSON.stringify({ videos }, null, 2)}\n`);
console.log(`playlist.json: ${videos.length} clip(s)`);
videos.forEach((video) => console.log(`  • ${video.file} — ${video.title}`));
