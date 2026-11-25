/** robots.txt and sitemap.xml for the one-page, three-language site. */

/** @param {string} siteUrl  without trailing slash */
export function robotsTxt(siteUrl) {
  return ["User-agent: *", "Allow: /", "", `Sitemap: ${siteUrl}/sitemap.xml`, ""].join("\n");
}

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

/**
 * One <url> per language (?lang=xx), each listing all alternates (hreflang),
 * as Google recommends for localized versions.
 * @param {string} siteUrl  @param {readonly string[]} languages  @param {string} lastmod  YYYY-MM-DD
 */
export function sitemapXml(siteUrl, languages, lastmod) {
  const page = (lang) => `${siteUrl}/?lang=${lang}`;
  const alternates = [
    ...languages.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(page(lang))}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${siteUrl}/`)}"/>`,
  ].join("\n");
  const urls = [`${siteUrl}/`, ...languages.map(page)]
    .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`)
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}
