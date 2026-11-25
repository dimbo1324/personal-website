import { cp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { buildCsp, buildHeadersFile } from "./csp.js";
import { robotsTxt, sitemapXml } from "./seoFiles.js";
import { rewriteRemoteImages, referencesUnsplash } from "./remoteImageRewrite.js";
import { writeHeroPlaylist } from "./heroPlaylist.js";

const HERO_DIR = "assets/video/hero";

/**
 * Points the <head> preload and the first <video> poster ([data-first-poster])
 * at the playlist's first clip — or removes them when there is none.
 * @param {string} html  @param {{ poster?: string }[]} videos
 */
export function syncFirstPoster(html, videos) {
  const poster = videos[0]?.poster ? `${HERO_DIR}/${videos[0].poster}` : null;
  return html
    .replace(/<link\b[^>]*\bdata-first-poster\b[^>]*>\s*/g, (tag) =>
      poster ? tag.replace(/href="[^"]*"/, `href="${poster}"`) : "",
    )
    .replace(/(<video\b[^>]*?)\sposter="[^"]*"([^>]*\bdata-first-poster\b)/g, (_, start, end) =>
      poster ? `${start} poster="${poster}"${end}` : `${start}${end}`,
    );
}

/** Classic <head> scripts merged into one request in production (each stays its own file in the source). */
const HEAD_SCRIPTS = Object.freeze(["theme-preload.js", "lang-preload.js"]);
const HEAD_BUNDLE = "head.js";

/** @param {string} html */
export function mergeHeadScripts(html) {
  const tags = HEAD_SCRIPTS.map((file) => `<script src="js/boot/${file}"></script>`);
  if (!tags.every((tag) => html.includes(tag))) return html;
  const [first, ...rest] = tags;
  let out = html.replace(first, `<script src="js/boot/${HEAD_BUNDLE}"></script>`);
  rest.forEach((tag) => {
    out = out.replace(new RegExp(`\\n?[ \\t]*${tag.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`), "");
  });
  return out;
}

/**
 * Glue between the buildless source tree and the Vite build:
 *  - keeps assets/video/hero/playlist.json in sync with the folder (build and dev);
 *  - fills %SITE_URL% in index.html (canonical, hreflang, OG, JSON-LD);
 *  - points the first-poster preload at the playlist's first clip;
 *  - swaps Unsplash URLs for local copies when they were downloaded;
 *  - copies what the code loads at runtime by path (assets/, js/boot/);
 *  - merges the render-blocking <head> scripts into one file;
 *  - writes _headers (CSP from the active settings), robots.txt, sitemap.xml.
 *
 * @param {{ root: string, siteUrl: string, languages: readonly string[], env: Record<string, string | undefined> }} options
 * @returns {import("vite").Plugin}
 */
export function staticSitePlugin({ root, siteUrl, languages, env }) {
  let outDir = join(root, "dist");
  const heroDir = join(root, HERO_DIR);
  let videos = [];
  const refreshPlaylist = async () => {
    ({ videos } = await writeHeroPlaylist(heroDir));
  };
  const manifestPath = join(root, "assets", "images", "remote", "manifest.json");
  const readManifest = async () => (existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, "utf8")) : { files: {} });

  return {
    name: "static-site",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async buildStart() {
      await refreshPlaylist();
    },
    configureServer(server) {
      // dropping a clip into the folder during `npm run dev` updates the playlist and reloads
      server.watcher.add(heroDir);
      const onChange = async (file) => {
        if (!file.startsWith(heroDir) || file.endsWith("playlist.json")) return;
        await refreshPlaylist();
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },
    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        const withUrl = syncFirstPoster(mergeHeadScripts(html.replaceAll("%SITE_URL%", siteUrl)), videos);
        return rewriteRemoteImages(withUrl, await readManifest());
      },
    },
    async closeBundle() {
      await mkdir(outDir, { recursive: true });
      await cp(join(root, "assets"), join(outDir, "assets"), {
        recursive: true,
        filter: (source) => !source.endsWith(".DS_Store"),
      });
      await cp(join(root, "js", "boot"), join(outDir, "js", "boot"), { recursive: true });
      const headSources = await Promise.all(HEAD_SCRIPTS.map((file) => readFile(join(root, "js", "boot", file), "utf8")));
      await writeFile(join(outDir, "js", "boot", HEAD_BUNDLE), headSources.join("\n"));

      const html = await readFile(join(outDir, "index.html"), "utf8");
      const bundles = await readdir(join(outDir, "bundle")).catch(() => []);
      const bundleText = await Promise.all(
        bundles.filter((f) => f.endsWith(".js")).map((f) => readFile(join(outDir, "bundle", f), "utf8")),
      );
      const csp = buildCsp({
        remoteImages: referencesUnsplash(html) || bundleText.some(referencesUnsplash),
        form: {
          provider: env.VITE_FORM_PROVIDER || "web3forms",
          endpoint: env.VITE_FORM_ENDPOINT || null,
          accessKey: env.VITE_FORM_ACCESS_KEY || null,
        },
        analytics: { provider: env.VITE_ANALYTICS_PROVIDER || "none", src: env.VITE_ANALYTICS_SRC || null },
      });

      const today = new Date().toISOString().slice(0, 10);
      await Promise.all([
        writeFile(join(outDir, "_headers"), buildHeadersFile(csp)),
        writeFile(join(outDir, "robots.txt"), robotsTxt(siteUrl)),
        writeFile(join(outDir, "sitemap.xml"), sitemapXml(siteUrl, languages, today)),
        writeFile(join(outDir, ".nojekyll"), ""),
      ]);
    },
  };
}
