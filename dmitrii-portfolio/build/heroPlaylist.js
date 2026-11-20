import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Regenerates assets/video/hero/playlist.json from the files in the folder.
 *
 * The playlist is what the site reads on every host (static hosts cannot list
 * folders). Keeps existing titles/descriptions (incl. { en, es, ru } objects)
 * and the "generated" flag; new clips get a title from the file name.
 * Companions are matched by name: NAME.mobile.mp4, NAME.webp|jpg|png.
 */
const VIDEO = ["mp4", "webm", "m4v", "mov"];
const POSTER = ["webp", "jpg", "jpeg", "png"];

const ext = (file) => file.split(".").pop().toLowerCase();
const stem = (file) => file.slice(0, -(ext(file).length + 1));
const base = (file) => stem(file).replace(/\.mobile$/, "");

export const humanize = (file) =>
  base(file)
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || file;

/**
 * Pure part: folder listing + previous playlist → new playlist.
 * @param {string[]} files
 * @param {{ file: string, title?: unknown, description?: unknown, generated?: boolean }[]} previous
 */
export function planPlaylist(files, previous = []) {
  const known = new Map(previous.map((entry) => [entry.file, entry]));
  const groups = new Map();
  for (const file of files) {
    const kind = VIDEO.includes(ext(file)) ? "video" : POSTER.includes(ext(file)) ? "poster" : null;
    if (!kind) continue;
    const key = base(file);
    const group = groups.get(key) ?? { main: null, mobile: null, poster: null };
    if (kind === "poster") group.poster ??= file;
    else if (stem(file).endsWith(".mobile")) group.mobile ??= file;
    else if (!group.main || ext(file) === "mp4") group.main = file;
    groups.set(key, group);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.main)
    .sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }))
    .map(([, group]) => {
      /** @type {{ title?: unknown, description?: unknown, generated?: boolean }} */
      const old = known.get(group.main) ?? {};
      return {
        file: group.main,
        ...(group.mobile ? { mobile: group.mobile } : {}),
        ...(group.poster ? { poster: group.poster } : {}),
        generated: old.generated ?? false,
        title: old.title ?? humanize(group.main),
        description: old.description ?? "",
      };
    });
}

/**
 * @param {string} directory  absolute path of assets/video/hero
 * @returns {Promise<{ videos: ReturnType<typeof planPlaylist>, changed: boolean }>}
 */
export async function writeHeroPlaylist(directory) {
  const manifest = join(directory, "playlist.json");
  const before = await readFile(manifest, "utf8").catch(() => "");
  const previous = (() => {
    try {
      return JSON.parse(before).videos ?? [];
    } catch {
      return [];
    }
  })();
  const files = await readdir(directory).catch(() => []);
  const videos = planPlaylist(files, previous);
  const after = `${JSON.stringify({ videos }, null, 2)}\n`;
  if (after !== before) await writeFile(manifest, after);
  return { videos, changed: after !== before };
}
