/**
 * Entry point. Module scripts are deferred, so the DOM is parsed by now.
 */
import { App } from "./app/App.js";

const app = new App().start();

// Expose for debugging in development consoles only.
if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  window.__app = app;
}
