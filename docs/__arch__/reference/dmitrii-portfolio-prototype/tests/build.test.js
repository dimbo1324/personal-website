import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsp, buildHeadersFile } from "../build/csp.js";
import { robotsTxt, sitemapXml } from "../build/seoFiles.js";
import { rewriteRemoteImages, referencesUnsplash } from "../build/remoteImageRewrite.js";
import { resolveSiteUrl, DEFAULT_SITE_URL } from "../build/siteConfig.js";

const directive = (csp, name) => csp.split("; ").find((part) => part.startsWith(`${name} `));

test("CSP stays strict by default", () => {
  const csp = buildCsp({ remoteImages: false });
  assert.equal(directive(csp, "script-src"), "script-src 'self'");
  assert.equal(directive(csp, "connect-src"), "connect-src 'self'");
  assert.equal(directive(csp, "img-src"), "img-src 'self' data: blob:");
  assert.match(csp, /object-src 'none'/);
});

test("CSP opens exactly what the configured services need", () => {
  const csp = buildCsp({
    remoteImages: true,
    form: { provider: "web3forms", accessKey: "k" },
    analytics: { provider: "plausible" },
  });
  assert.match(directive(csp, "img-src"), /https:\/\/images\.unsplash\.com/);
  assert.equal(directive(csp, "connect-src"), "connect-src 'self' https://api.web3forms.com https://plausible.io");
  assert.equal(directive(csp, "script-src"), "script-src 'self' https://plausible.io");

  const own = buildCsp({
    form: { endpoint: "https://api.example.com/requests" },
    analytics: { provider: "umami", src: "https://stats.example.com/s.js" },
  });
  assert.match(directive(own, "connect-src"), /https:\/\/api\.example\.com https:\/\/stats\.example\.com/);
  assert.doesNotMatch(buildCsp({ form: { provider: "web3forms" } }), /web3forms/, "no key → not allowed");
  assert.match(buildHeadersFile("x"), /^\/\*\n {2}Content-Security-Policy: x$/m);
});

test("robots.txt and sitemap.xml point at the site URL and list every language", () => {
  assert.match(robotsTxt("https://dp.uy"), /Sitemap: https:\/\/dp\.uy\/sitemap\.xml/);
  const xml = sitemapXml("https://dp.uy", ["en", "es", "ru"], "2026-11-20");
  assert.equal(xml.match(/<url>/g).length, 4);
  assert.match(xml, /hreflang="es" href="https:\/\/dp\.uy\/\?lang=es"/);
  assert.match(xml, /hreflang="x-default"/);
});

test("Unsplash URLs are swapped only when a local copy exists", () => {
  const html =
    '<img src="https://images.unsplash.com/photo-1?auto=format&amp;fit=crop&amp;w=960&amp;q=75" srcset="https://images.unsplash.com/photo-1?auto=format&amp;w=480&amp;q=75 480w">';
  const out = rewriteRemoteImages(html, { files: { "photo-1@960": "assets/images/remote/a-960.webp" } });
  assert.match(out, /src="assets\/images\/remote\/a-960\.webp"/);
  assert.ok(referencesUnsplash(out), "the 480w entry had no local copy");
});

test("site URL comes from the environment, without a trailing slash", () => {
  assert.equal(resolveSiteUrl({ VITE_SITE_URL: "https://dp.example.uy/" }), "https://dp.example.uy");
  assert.equal(resolveSiteUrl({}), DEFAULT_SITE_URL);
  assert.throws(() => resolveSiteUrl({ VITE_SITE_URL: "not a url" }));
});

test("the two <head> boot scripts become one request in production", async () => {
  const { mergeHeadScripts } = await import("../build/vite-plugin-static-site.js");
  const html = [
    "<head>",
    '    <script src="js/boot/theme-preload.js"></script>',
    '    <script src="js/boot/lang-preload.js"></script>',
    '    <script src="js/boot/file-protocol-guard.js" defer></script>',
    "</head>",
  ].join("\n");
  assert.equal(
    mergeHeadScripts(html),
    [
      "<head>",
      '    <script src="js/boot/head.js"></script>',
      '    <script src="js/boot/file-protocol-guard.js" defer></script>',
      "</head>",
    ].join("\n"),
  );
  assert.equal(mergeHeadScripts("<head></head>"), "<head></head>", "untouched when the tags are absent");
});

test("the first-poster preload follows the playlist", async () => {
  const { syncFirstPoster } = await import("../build/vite-plugin-static-site.js");
  const html = [
    '<link rel="preload" href="assets/video/hero/01-old.webp" as="image" data-first-poster />',
    '    <link rel="stylesheet" href="x.css" />',
    '<video class="v" poster="assets/video/hero/01-old.webp" data-first-poster></video>',
  ].join("\n");

  const updated = syncFirstPoster(html, [{ poster: "01-new.webp" }]);
  assert.equal(updated.match(/01-new\.webp/g).length, 2);
  assert.match(updated, /data-first-poster \/>\n {4}<link rel="stylesheet"/, "formatting kept");

  const empty = syncFirstPoster(html, []);
  assert.doesNotMatch(empty, /rel="preload"/);
  assert.doesNotMatch(empty, /poster=/);
  assert.match(empty, /<video class="v" data-first-poster><\/video>/);
});

test("planPlaylist groups the folder and keeps hand-written titles", async () => {
  const { planPlaylist } = await import("../build/heroPlaylist.js");
  const videos = planPlaylist(
    ["02-new-clip.mp4", "01-a.mp4", "01-a.mobile.mp4", "01-a.webp", "playlist.json", "02-new-clip.webm"],
    [{ file: "01-a.mp4", title: { en: "A", es: "A-es" }, generated: true }],
  );
  assert.deepEqual(videos, [
    {
      file: "01-a.mp4",
      mobile: "01-a.mobile.mp4",
      poster: "01-a.webp",
      generated: true,
      title: { en: "A", es: "A-es" },
      description: "",
    },
    { file: "02-new-clip.mp4", generated: false, title: "New Clip", description: "" },
  ]);
});
