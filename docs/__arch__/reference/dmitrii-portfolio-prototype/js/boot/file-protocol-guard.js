/**
 * ES modules cannot be loaded from file:// (browsers block it via CORS).
 * When the page is opened by double-click, explain how to run it instead
 * of silently showing a half-working page.
 */
(function fileProtocolGuard() {
  "use strict";
  if (window.location.protocol !== "file:") return;

  var banner = document.createElement("div");
  banner.className = "file-guard";
  banner.setAttribute("role", "alert");

  var title = document.createElement("strong");
  title.textContent = "Run this project through a local web server.";

  var text = document.createElement("span");
  text.textContent =
    " Browsers block JavaScript modules on file://. Use VS Code “Live Server”, or run “npx serve .” / “python -m http.server” in the project folder.";

  banner.appendChild(title);
  banner.appendChild(text);
  document.body.appendChild(banner);
})();
