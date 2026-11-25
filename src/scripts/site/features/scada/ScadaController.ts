import { Component } from "../../core/component";
import type { Store } from "../../core/store";
import type { AppState } from "../../app/state";
import type { ActionResult } from "./ProcessModel";
import { ProcessModel } from "./ProcessModel";
import { ScadaView } from "./ScadaView";
import type { ScadaElements } from "./ScadaView";
import { EventLog } from "./EventLog";

interface ScadaInputs {
  readonly pumpButton: HTMLButtonElement;
  readonly esdButton: HTMLButtonElement;
  readonly disturbButton: HTMLButtonElement;
  readonly setpointInput: HTMLInputElement;
  readonly unitPump: SVGElement;
  readonly unitValve: SVGElement;
  readonly unitGateway: SVGElement;
}

interface ScadaControllerOptions {
  readonly view: Omit<ScadaElements, "window">;
  readonly log: HTMLOListElement;
  readonly inputs: ScadaInputs;
  readonly store: Store<AppState>;
}

/** Wires operator inputs → ProcessModel → ScadaView. */
export class ScadaController extends Component<HTMLElement> {
  static readonly STEP_MS = 450;

  readonly #model = new ProcessModel({ setpoint: 76 });
  readonly #view: ScadaView;
  readonly #log: EventLog;
  readonly #inputs: ScadaInputs;
  readonly #store: Store<AppState>;
  #timer = 0;

  constructor(root: HTMLElement, { view, log, inputs, store }: ScadaControllerOptions) {
    super(root);
    this.#view = new ScadaView({ ...view, window: root });
    this.#log = new EventLog(log);
    this.#inputs = inputs;
    this.#store = store;
  }

  override mount(): this {
    const {
      pumpButton,
      esdButton,
      disturbButton,
      setpointInput,
      unitPump,
      unitValve,
      unitGateway,
    } = this.#inputs;

    this.#bindAction([pumpButton, unitPump], () => this.#model.togglePump());
    this.#bindAction([esdButton, unitGateway], () => this.#model.toggleEsd());
    this.#bindAction([unitValve], () => this.#model.stepValve());
    this.#bindAction([disturbButton], () => this.#model.injectDisturbance());

    this.on(setpointInput, "input", () => this.#model.setSetpoint(Number(setpointInput.value)));
    this.on(setpointInput, "change", () => {
      this.#log.push(`PID setpoint updated → ${this.#model.setpoint}%`);
    });

    this.own(this.#model.onChange((model) => this.#view.render(model)));
    this.own(this.#store.subscribe("widgetState", (state) => this.#onWindowState(state)));
    this.#view.render(this.#model);
    return super.mount();
  }

  protected override onDestroy(): void {
    window.clearInterval(this.#timer);
  }

  #bindAction(elements: readonly Element[], action: () => ActionResult): void {
    const run = (): void => {
      this.#log.push(action().message);
    };
    for (const element of elements) {
      this.on(element, "click", run);
      if (element.getAttribute("role") === "button") {
        this.on(element, "keydown", (event) => {
          const keyEvent = event as KeyboardEvent;
          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
            keyEvent.preventDefault();
            run();
          }
        });
      }
    }
  }

  #onWindowState(state: AppState["widgetState"]): void {
    window.clearInterval(this.#timer);
    if (state !== "open") return;
    if (this.#log.isEmpty) this.#log.push("OPC UA session established · 4 PID loops synced");
    this.#timer = window.setInterval(() => this.#model.step(), ScadaController.STEP_MS);
  }
}
