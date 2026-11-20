/**
 * Runs synchronously in <head> before first paint.
 * The HTML is written in English; when the visitor will get another language
 * (?lang=, saved choice or browser preference — same order as
 * js/i18n/resolveInitialLanguage.js), translatable text is kept invisible
 * until the translations are applied, so English never flashes.
 * CSS releases the text on its own after a moment if scripts fail.
 */
(function markPendingLanguage() {
  "use strict";
  var SUPPORTED = ["en", "es", "ru"];
  var lang = null;
  try {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.indexOf(fromUrl) !== -1) lang = fromUrl;
    if (!lang) {
      var saved = window.localStorage.getItem("dp.lang");
      if (SUPPORTED.indexOf(saved) !== -1) lang = saved;
    }
  } catch (error) {
    /* storage unavailable — fall through to the browser preference */
  }
  if (!lang) {
    var preferred = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < preferred.length && !lang; i += 1) {
      var primary = String(preferred[i]).toLowerCase().split("-")[0];
      if (SUPPORTED.indexOf(primary) !== -1) lang = primary;
    }
  }
  if (lang && lang !== "en") {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-i18n-pending", "");
  }
})();
