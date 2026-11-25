import { hook, hooks } from "../../core/dom.js";
import { ScadaWindow } from "../../features/scada/ScadaWindow.js";
import { ScadaController } from "../../features/scada/ScadaController.js";
import { ANALYTICS_EVENTS } from "../../features/analytics/events.js";

/**
 * The floating ACS TP / SCADA widget. It is a technical HMI, so it stays in
 * English in every language (like the real screens it imitates).
 * @param {import("../App.js").AppContext} ctx
 */
export function initScada({ use, store, analytics, dispose }) {
  const root = hook("scada-window");
  use(
    root,
    (element) =>
      new ScadaWindow(element, {
        dragHandle: hook("scada-drag"),
        resizeGrip: hook("scada-resize"),
        dock: hook("widget-dock"),
        openButtons: hooks("open-widget"),
        minimize: hook("scada-minimize"),
        maximize: hook("scada-maximize"),
        close: hook("scada-close"),
        store,
      }),
  );
  use(
    root,
    (element) =>
      new ScadaController(element, {
        store,
        log: hook("scada-log"),
        inputs: {
          pumpButton: hook("scada-pump"),
          esdButton: hook("scada-esd"),
          disturbButton: hook("scada-disturb"),
          setpointInput: hook("scada-sp"),
          unitPump: hook("scada-unit-pump"),
          unitValve: hook("scada-unit-valve"),
          unitGateway: hook("scada-unit-gateway"),
        },
        view: {
          pumpButton: hook("scada-pump"),
          pumpText: hook("scada-pump-text"),
          esdButton: hook("scada-esd"),
          esdText: hook("scada-esd-text"),
          mode: hook("scada-mode"),
          dot: hook("scada-dot"),
          unitPump: hook("scada-unit-pump"),
          unitValve: hook("scada-unit-valve"),
          unitGateway: hook("scada-unit-gateway"),
          flows: hooks("scada-flow"),
          pumpStat: hook("scada-pump-stat"),
          valveStat: hook("scada-valve-stat"),
          tempStat: hook("scada-temp-stat"),
          esdStat: hook("scada-esd-stat"),
          pvReadout: hook("scada-pv"),
          setpointText: hook("scada-sp-text"),
          setpointInput: hook("scada-sp"),
          setpointLine: hook("scada-sp-line"),
          trendLine: hook("scada-trend-line"),
          trendArea: hook("scada-trend-area"),
        },
      }),
  );

  // count real openings, not restores from the dock
  dispose(
    store.subscribe(
      "widgetState",
      (state, previous) => {
        if (state === "open" && previous === "closed") analytics.track(ANALYTICS_EVENTS.widgetOpen);
      },
      { immediate: false },
    ),
  );
}
