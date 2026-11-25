// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProcessModel } from "../src/scripts/site/features/scada/ProcessModel";
import { EventLog } from "../src/scripts/site/features/scada/EventLog";
import { ScadaView } from "../src/scripts/site/features/scada/ScadaView";
import type { ScadaElements } from "../src/scripts/site/features/scada/ScadaView";
import { ScadaWindow } from "../src/scripts/site/features/scada/ScadaWindow";
import { Store } from "../src/scripts/site/core/store";
import type { AppState } from "../src/scripts/site/app/state";
import { setBody } from "./helpers/dom";

function makeStore(): Store<AppState> {
  return new Store<AppState>({
    theme: "dark",
    activeSection: "overview",
    heroScene: 0,
    simRunning: true,
    cycle: 1,
    widgetState: "closed",
    widgetMaximized: false,
  });
}

function svg<T extends SVGElement>(tag: string): T {
  return document.createElementNS("http://www.w3.org/2000/svg", tag) as T;
}

function viewElements(root: HTMLElement): ScadaElements {
  const button = (): HTMLButtonElement => document.createElement("button");
  return {
    window: root,
    pumpButton: button(),
    pumpText: document.createElement("span"),
    esdButton: button(),
    esdText: document.createElement("span"),
    mode: document.createElement("span"),
    dot: document.createElement("span"),
    unitPump: svg("g"),
    unitValve: svg("g"),
    unitGateway: svg("g"),
    flows: [svg("path")],
    pumpStat: svg("text"),
    valveStat: svg("text"),
    tempStat: svg("text"),
    esdStat: svg("text"),
    pvReadout: document.createElement("span"),
    setpointText: document.createElement("span"),
    setpointInput: document.createElement("input"),
    setpointLine: svg("line"),
    trendLine: svg("path"),
    trendArea: svg("path"),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.documentElement.className = "";
});

describe("ProcessModel", () => {
  it("toggles the pump and enforces the ESD interlock", () => {
    const model = new ProcessModel({ setpoint: 80 });
    expect(model.running).toBe(true);
    expect(model.togglePump()).toEqual({ ok: true, message: "P-101 command → STOP" });
    expect(model.running).toBe(false);
    expect(model.togglePump().ok).toBe(true);

    expect(model.toggleEsd().ok).toBe(true);
    expect(model.running).toBe(false);
    const blocked = model.togglePump();
    expect(blocked.ok).toBe(false);
    expect(blocked.message).toContain("Blocked");
    expect(model.toggleEsd().ok).toBe(true);
  });

  it("steps the valve and the simulation", () => {
    const model = new ProcessModel({ setpoint: 86 });
    const listener = vi.fn();
    const unsubscribe = model.onChange(listener);
    expect(model.stepValve()).toEqual({ ok: true, message: "CV-301 setpoint → 98%" });
    expect(model.stepValve().message).toContain("50%");
    expect(model.injectDisturbance().ok).toBe(true);

    for (let index = 0; index < 5; index += 1) model.step();
    expect(model.history).toHaveLength(ProcessModel.HISTORY);
    expect(model.pv).toBeGreaterThanOrEqual(0);
    expect(model.pv).toBeLessThanOrEqual(100);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    model.step();
    expect(listener).toHaveBeenCalledTimes(7);
  });
});

describe("EventLog", () => {
  it("prepends entries and caps the list", () => {
    const list = document.createElement("ol");
    const log = new EventLog(list);
    expect(log.isEmpty).toBe(true);
    for (let index = 0; index < EventLog.MAX_ENTRIES + 3; index += 1) log.push(`event ${index}`);
    expect(log.isEmpty).toBe(false);
    expect(list.children).toHaveLength(EventLog.MAX_ENTRIES);
    expect(list.firstElementChild?.textContent).toContain("event 16");
  });
});

describe("ScadaView", () => {
  it("renders state into the schematic", () => {
    const root = document.createElement("div");
    const elements = viewElements(root);
    const view = new ScadaView(elements);
    const model = new ProcessModel({ setpoint: 76 });

    view.render(model);
    expect(elements.pumpText.textContent).toBe("Pump P-101: On");
    expect(elements.mode.textContent).toBe("· Running");
    expect(elements.pvReadout.textContent).toBe("PV 76.0%");
    expect(elements.setpointText.textContent).toBe("76%");
    expect(elements.trendLine.getAttribute("d")).toContain("M0.0");

    model.toggleEsd();
    view.render(model);
    expect(root.classList.contains("is-tripped")).toBe(true);
    expect(elements.esdText.textContent).toBe("SIS / ESD: Tripped");
    expect(elements.valveStat.textContent).toBe("CLOSED · 0.0%");
  });
});

describe("ScadaWindow", () => {
  it("opens, minimises, maximises and closes from the store", () => {
    setBody(`
      <aside data-js="window"></aside>
      <button data-js="dock"></button><button data-js="min"></button>
      <button data-js="max"></button><button data-js="close"></button>
      <button data-js="open"></button><div data-js="drag"></div><div data-js="resize"></div>
    `);
    const get = (name: string): HTMLElement => {
      const element = document.querySelector<HTMLElement>(`[data-js="${name}"]`);
      if (!element) throw new Error(`missing ${name}`);
      return element;
    };
    const store = makeStore();
    const window = new ScadaWindow(get("window"), {
      dragHandle: get("drag"),
      resizeGrip: get("resize"),
      dock: get("dock") as HTMLButtonElement,
      openButtons: [get("open")],
      minimize: get("min") as HTMLButtonElement,
      maximize: get("max") as HTMLButtonElement,
      close: get("close") as HTMLButtonElement,
      store,
    }).mount();

    get("open").click();
    expect(store.get("widgetState")).toBe("open");
    expect(get("window").classList.contains("is-open")).toBe(true);
    expect(get("window").getAttribute("aria-hidden")).toBe("false");
    expect(get("window").inert).toBe(false);

    get("min").click();
    expect(store.get("widgetState")).toBe("minimized");
    expect(get("dock").classList.contains("is-visible")).toBe(true);
    get("dock").click();
    expect(store.get("widgetState")).toBe("open");

    get("max").click();
    expect(store.get("widgetMaximized")).toBe(true);
    get("close").click();
    expect(store.get("widgetState")).toBe("closed");
    window.destroy();
  });
});
