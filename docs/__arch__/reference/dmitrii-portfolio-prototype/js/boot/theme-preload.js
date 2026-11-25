/**
 * Runs synchronously in <head> before first paint.
 * Applies the persisted theme so the page never flashes the wrong palette.
 * Kept as a classic (non-module) script on purpose: modules are deferred.
 */
(function applyPersistedTheme() {
  "use strict";
  var STORAGE_KEY = "dp.theme";
  var theme = "dark";
  try {
    var saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      theme = saved;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      theme = "light";
    }
  } catch (error) {
    /* storage unavailable (private mode, sandbox) — keep default */
  }
  document.documentElement.setAttribute("data-theme", theme);
})();
