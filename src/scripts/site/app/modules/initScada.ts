import { hook, hooks } from "../../core/dom";
import { ScadaWindow } from "../../features/scada/ScadaWindow";
import { ScadaController } from "../../features/scada/ScadaController";
import { ANALYTICS_EVENTS } from "../../features/analytics/events";
import type { AppContext } from "../types";

/** The floating ACS TP / SCADA widget. Technical labels stay in English. */
export function initScada({ use, store, analytics, dispose }: AppContext): void {
  const root = hook("scada-window");
  const svg = (tag: string): SVGElement =>
    document.createElementNS("http://www.w3.org/2000/svg", tag);
  const button = (): HTMLButtonElement => document.createElement("button");
  const input = (): HTMLInputElement => document.createElement("input");

  use(
    root,
    (element) =>
      new ScadaWindow(element, {
        dragHandle: hook("scada-drag") ?? element,
        resizeGrip: hook("scada-resize") ?? element,
        dock: hook<HTMLButtonElement>("widget-dock") ?? button(),
        openButtons: hooks("open-widget"),
        minimize: hook<HTMLButtonElement>("scada-minimize") ?? button(),
        maximize: hook<HTMLButtonElement>("scada-maximize") ?? button(),
        close: hook<HTMLButtonElement>("scada-close") ?? button(),
        store,
      }),
  );
  use(
    root,
    (element) =>
      new ScadaController(element, {
        store,
        log: hook<HTMLOListElement>("scada-log") ?? document.createElement("ol"),
        inputs: {
          pumpButton: hook<HTMLButtonElement>("scada-pump") ?? button(),
          esdButton: hook<HTMLButtonElement>("scada-esd") ?? button(),
          disturbButton: hook<HTMLButtonElement>("scada-disturb") ?? button(),
          setpointInput: hook<HTMLInputElement>("scada-sp") ?? input(),
          unitPump: hook<SVGElement>("scada-unit-pump") ?? svg("g"),
          unitValve: hook<SVGElement>("scada-unit-valve") ?? svg("g"),
          unitGateway: hook<SVGElement>("scada-unit-gateway") ?? svg("g"),
        },
        view: {
          pumpButton: hook<HTMLButtonElement>("scada-pump") ?? button(),
          pumpText: hook("scada-pump-text") ?? element,
          esdButton: hook<HTMLButtonElement>("scada-esd") ?? button(),
          esdText: hook("scada-esd-text") ?? element,
          mode: hook("scada-mode") ?? element,
          dot: hook("scada-dot") ?? element,
          unitPump: hook<SVGElement>("scada-unit-pump") ?? svg("g"),
          unitValve: hook<SVGElement>("scada-unit-valve") ?? svg("g"),
          unitGateway: hook<SVGElement>("scada-unit-gateway") ?? svg("g"),
          flows: hooks<SVGElement>("scada-flow"),
          pumpStat: hook<SVGTextElement>("scada-pump-stat") ?? (svg("text") as SVGTextElement),
          valveStat: hook<SVGTextElement>("scada-valve-stat") ?? (svg("text") as SVGTextElement),
          tempStat: hook<SVGTextElement>("scada-temp-stat") ?? (svg("text") as SVGTextElement),
          esdStat: hook<SVGTextElement>("scada-esd-stat") ?? (svg("text") as SVGTextElement),
          pvReadout: hook("scada-pv") ?? element,
          setpointText: hook("scada-sp-text") ?? element,
          setpointInput: hook<HTMLInputElement>("scada-sp") ?? input(),
          setpointLine: hook<SVGLineElement>("scada-sp-line") ?? (svg("line") as SVGLineElement),
          trendLine: hook<SVGPathElement>("scada-trend-line") ?? (svg("path") as SVGPathElement),
          trendArea: hook<SVGPathElement>("scada-trend-area") ?? (svg("path") as SVGPathElement),
        },
      }),
  );

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
