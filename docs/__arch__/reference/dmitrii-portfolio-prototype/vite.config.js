import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { staticSitePlugin } from "./build/vite-plugin-static-site.js";
import { resolveSiteUrl, SITE_LANGUAGES } from "./build/siteConfig.js";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, root, "VITE_"), ...process.env };
  return {
    root,
    // relative paths: the build works from a domain root and from a sub-path (GitHub Pages project site)
    base: "./",
    publicDir: false,
    build: {
      outDir: "dist",
      emptyOutDir: true,
      // "assets/" is the site's own runtime folder (copied as is); Vite's hashed output goes to "bundle/"
      assetsDir: "bundle",
      target: "es2022",
      cssMinify: true,
      sourcemap: false,
    },
    server: { port: 5173, open: false },
    preview: { port: 4173 },
    plugins: [staticSitePlugin({ root, siteUrl: resolveSiteUrl(env), languages: SITE_LANGUAGES, env })],
  };
});
