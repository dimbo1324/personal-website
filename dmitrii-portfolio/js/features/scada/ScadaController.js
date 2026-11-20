import { Component } from "../../core/Component.js";
import { ProcessModel } from "./ProcessModel.js";
import { ScadaView } from "./ScadaView.js";
import { EventLog } from "./EventLog.js";

/**
 * Wires operator inputs → ProcessModel → ScadaView.
 * The simulation only steps while the window is open.
 */
export class ScadaController extends Component {
  static STEP_MS = 450;

  #model = new ProcessModel({ setpoint: 76 });
  #view;
  #log;
  #inputs;
  #timer = 0;

  /**
   * @param {HTMLElement} root  the window element
   * @param {{ view: Record<string, any>, log: HTMLOListElement, inputs: Record<string, any>,
   *           store: import("../../core/Store.js").Store }} options
   */
  constructor(root, { view, log, inputs, store }) {
    super(root);
    this.#view = new ScadaView({ window: root, ...view });
    this.#log = new EventLog(log);
    this.#inputs = inputs;
    this.store = store;
  }

  mount() {
    const { pumpButton, esdButton, disturbButton, setpointInput, unitPump, unitValve, unitGateway } = this.#inputs;

    this.#bindAction([pumpButton, unitPump], () => this.#model.togglePump());
    this.#bindAction([esdButton, unitGateway], () => this.#model.toggleEsd());
    this.#bindAction([unitValve], () => this.#model.stepValve());
    this.#bindAction([disturbButton], () => this.#model.injectDisturbance());

    this.on(setpointInput, "input", () => this.#model.setSetpoint(Number(setpointInput.value)));
    this.on(setpointInput, "change", () => this.#log.push(`PID setpoint updated → ${this.#model.setpoint}%`));

    this.own(this.#model.onChange((model) => this.#view.render(model)));
    this.own(this.store.subscribe("widgetState", (state) => this.#onWindowState(state)));
    this.#view.render(this.#model);
    return super.mount();
  }

  onDestroy() {
    clearInterval(this.#timer);
  }

  #bindAction(elements, action) {
    const run = () => this.#log.push(action().message);
    elements.forEach((element) => {
      this.on(element, "click", run);
      if (element.getAttribute("role") === "button") {
        this.on(element, "keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            run();
          }
        });
      }
    });
  }

  #onWindowState(state) {
    clearInterval(this.#timer);
    if (state !== "open") return;
    if (this.#log.isEmpty) this.#log.push("OPC UA session established · 4 PID loops synced");
    this.#timer = window.setInterval(() => this.#model.step(), ScadaController.STEP_MS);
  }
}
