import { App } from "./app/App";

/** Entry point. Module scripts are deferred, so the DOM is parsed by now. */
const app = new App().start();

if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  (window as Window & { app?: App }).app = app;
}
