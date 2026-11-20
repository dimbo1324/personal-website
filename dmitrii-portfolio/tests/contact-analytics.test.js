import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPhone, e164, telHref, whatsAppHref } from "../js/features/contact/phoneNumber.js";
import { visitorOptedOut } from "../js/features/analytics/privacySignals.js";
import { createAnalyticsProvider } from "../js/features/analytics/createAnalyticsProvider.js";
import { NullProvider } from "../js/features/analytics/providers/NullProvider.js";
import { PlausibleProvider } from "../js/features/analytics/providers/PlausibleProvider.js";
import { UmamiProvider } from "../js/features/analytics/providers/UmamiProvider.js";
import { CONTACT } from "../js/data/contact.js";

test("phone helpers assemble the number from its parts", () => {
  assert.equal(formatPhone(CONTACT.phone), "+598 96 671 725");
  assert.equal(e164(CONTACT.phone), "+59896671725");
  assert.equal(telHref(CONTACT.phone), "tel:+59896671725");
  assert.equal(whatsAppHref(CONTACT.phone), "https://wa.me/59896671725");
});

test("Do Not Track and Global Privacy Control switch analytics off", () => {
  const nav = (extra) => /** @type {any} */ ({ doNotTrack: null, ...extra });
  const win = /** @type {any} */ ({});
  assert.equal(visitorOptedOut(nav({ doNotTrack: "1" }), win), true);
  assert.equal(visitorOptedOut(nav({ globalPrivacyControl: true }), win), true);
  assert.equal(visitorOptedOut(nav({}), /** @type {any} */ ({ doNotTrack: "1" })), true);
  assert.equal(visitorOptedOut(nav({ doNotTrack: "0" }), win), false);
});

test("analytics provider selection", () => {
  const off = { provider: "none", domain: null, src: null, websiteId: null };
  assert.ok(createAnalyticsProvider(off, { optedOut: false }) instanceof NullProvider);
  assert.ok(
    createAnalyticsProvider({ ...off, provider: "plausible", domain: "x.uy" }, { optedOut: false }) instanceof PlausibleProvider,
  );
  assert.ok(
    createAnalyticsProvider({ ...off, provider: "umami", websiteId: "id" }, { optedOut: false }) instanceof UmamiProvider,
  );
  assert.ok(
    createAnalyticsProvider({ ...off, provider: "plausible", domain: "x.uy" }, { optedOut: true }) instanceof NullProvider,
  );

  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.ok(
      createAnalyticsProvider({ ...off, provider: "plausible" }, { optedOut: false }) instanceof NullProvider,
      "misconfigured → off",
    );
  } finally {
    console.warn = warn;
  }
});
