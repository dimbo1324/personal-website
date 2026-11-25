import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { I18nService } from "../js/i18n/I18nService.js";
import { resolveInitialLanguage } from "../js/i18n/resolveInitialLanguage.js";
import { interpolate } from "../js/i18n/interpolate.js";
import { selectPlural } from "../js/i18n/selectPlural.js";
import { localize } from "../js/i18n/localize.js";
import en from "../js/i18n/locales/en.js";
import es from "../js/i18n/locales/es.js";
import ru from "../js/i18n/locales/ru.js";

test("every locale has exactly the same keys", () => {
  const keys = Object.keys(en).sort();
  assert.deepEqual(Object.keys(es).sort(), keys, "es");
  assert.deepEqual(Object.keys(ru).sort(), keys, "ru");
});

test("every data-i18n key used in index.html exists", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const used = new Set();
  for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) used.add(key);
  for (const [, pairs] of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    pairs.split(";").forEach((pair) => used.add(pair.split(":")[1].trim()));
  }
  const missing = [...used].filter((key) => !(key in en));
  assert.deepEqual(missing, []);
  assert.ok(used.size > 150, "sanity: the page is annotated");
});

test("placeholders match between languages", () => {
  const vars = (message) =>
    [...JSON.stringify(message).matchAll(/\{(\w+)\}/g)]
      .map((m) => m[1])
      .sort()
      .filter((v, i, a) => a.indexOf(v) === i);
  for (const key of Object.keys(en)) {
    assert.deepEqual(vars(es[key]), vars(en[key]), `es ${key}`);
    assert.deepEqual(vars(ru[key]), vars(en[key]), `ru ${key}`);
  }
});

test("I18nService translates, falls back and notifies", () => {
  const writes = [];
  const i18n = new I18nService({
    dictionaries: { en: { hi: "Hi {name}", only: "English only" }, es: { hi: "Hola {name}" }, ru: {} },
    initial: "es",
    storage: /** @type {any} */ ({ write: (key, value) => writes.push([key, value]) }),
  });
  assert.equal(i18n.t("hi", { name: "Ana" }), "Hola Ana");
  assert.equal(i18n.t("only"), "English only");
  assert.equal(i18n.t("missing.key"), "missing.key");

  const seen = [];
  i18n.subscribe((lang) => seen.push(lang), { immediate: false });
  i18n.set("ru");
  i18n.set("xx");
  assert.deepEqual(seen, ["ru"]);
  assert.deepEqual(writes, [["lang", "ru"]]);
  assert.equal(i18n.pick({ en: "A", ru: "Б" }), "Б");
});

test("Russian plurals choose the right form", () => {
  const forms = ru["gallery.count"];
  const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "ru" });
  assert.equal(i18n.t("gallery.count", { count: 1, n: "01" }), forms.one.replace("{n}", "01"));
  assert.equal(i18n.t("gallery.count", { count: 3, n: "03" }), forms.few.replace("{n}", "03"));
  assert.equal(i18n.t("gallery.count", { count: 8, n: "08" }), forms.many.replace("{n}", "08"));
  assert.equal(selectPlural({ one: "x", other: "y" }, 2, "en"), "y");
});

test("resolveInitialLanguage: URL > saved > browser > English", () => {
  assert.equal(resolveInitialLanguage({ search: "?lang=ru", stored: "es", preferred: ["en"] }), "ru");
  assert.equal(resolveInitialLanguage({ search: "?lang=de", stored: "es" }), "es");
  assert.equal(resolveInitialLanguage({ preferred: ["de-DE", "es-UY"] }), "es");
  assert.equal(resolveInitialLanguage({ preferred: ["de"] }), "en");
});

test("interpolate keeps unknown placeholders visible; localize falls back", () => {
  assert.equal(interpolate("{a} and {b}", { a: 1 }), "1 and {b}");
  assert.equal(localize({ en: "A", es: "B" }, "ru"), "A");
  assert.equal(localize(null, "en"), "");
});
