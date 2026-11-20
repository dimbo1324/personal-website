#!/usr/bin/env node
/**
 * Regenerates assets/video/hero/playlist.json from the files in the folder.
 * Runs automatically in `npm run build` and while `npm run dev` is running
 * (the Vite plugin watches the folder), so adding a clip is just dropping
 * the file in. Logic: build/heroPlaylist.js.
 *
 * Usage:  node scripts/build-hero-playlist.mjs
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeHeroPlaylist } from "../build/heroPlaylist.js";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "video", "hero");
const { videos, changed } = await writeHeroPlaylist(DIR);

console.log(`playlist.json: ${videos.length} clip(s)${changed ? " — updated" : ""}`);
videos.forEach((video) => console.log(`  • ${video.file}${video.mobile ? " (+mobile)" : ""}${video.poster ? " (+poster)" : ""}`));
