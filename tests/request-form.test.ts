// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RequestForm } from "../src/scripts/site/features/request/RequestForm";
import { REQUEST_CONFIG } from "../src/scripts/site/data/request";
import { MailtoGateway } from "../src/scripts/site/features/request/gateways/MailtoGateway";
import { CopyToClipboard } from "../src/scripts/site/services/clipboard";
import { Toast } from "../src/scripts/site/services/toast";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });

function field(name: string, control = "input"): string {
  return `<div data-field="${name}"><${control} name="${name}"></${control}><p data-field-error></p></div>`;
}

function mountForm(): {
  form: HTMLFormElement;
  success: HTMLElement;
  status: HTMLElement;
  submit: HTMLButtonElement;
} {
  setBody(`
    <div data-js="card">
      <form data-js="form">
        ${field("lastName")}${field("firstName")}${field("middleName")}
        ${field("phone")}${field("email")}${field("message", "textarea")}
        <div data-field="consent"><input type="checkbox" name="consent" /><p data-field-error></p></div>
        <input name="website" />
        <button data-js="submit" type="submit"></button>
        <button data-js="copy" type="button"></button>
      </form>
      <p data-js="status"></p>
      <div data-js="success"><p data-js="success-text"></p><button data-js="reset"></button></div>
      <span data-js="counter"></span><p data-js="hint"></p>
      <div data-js="toast"></div>
    </div>
  `);
  const get = (name: string): HTMLElement => {
    const element = document.querySelector<HTMLElement>(`[data-js="${name}"]`);
    if (!element) throw new Error(`missing ${name}`);
    return element;
  };
  const clipboard = new CopyToClipboard(new Toast(get("toast")), i18n);
  new RequestForm(get("form") as HTMLFormElement, {
    config: REQUEST_CONFIG,
    i18n,
    clipboard,
    ui: {
      status: get("status"),
      hint: get("hint"),
      submit: get("submit") as HTMLButtonElement,
      success: get("success"),
      successText: get("success-text"),
      copyButton: get("copy") as HTMLButtonElement,
      resetButton: get("reset") as HTMLButtonElement,
      counter: get("counter"),
    },
  }).mount();
  return {
    form: get("form") as HTMLFormElement,
    success: get("success"),
    status: get("status"),
    submit: get("submit") as HTMLButtonElement,
  };
}

function submit(form: HTMLFormElement): void {
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function fill(form: HTMLFormElement, values: Record<string, string>): void {
  for (const [name, value] of Object.entries(values)) {
    const control = form.elements.namedItem(name);
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)
      control.value = value;
  }
}

beforeEach(() => {
  sessionStorage.clear();
  i18n.set("en");
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  sessionStorage.clear();
});

describe("RequestForm", () => {
  it("marks every invalid field and focuses the first one", () => {
    const { form, status } = mountForm();
    submit(form);
    expect(status.textContent).toContain("Please check");
    expect(form.querySelectorAll('[aria-invalid="true"]').length).toBeGreaterThan(2);
  });

  it("saves a draft after a debounce and restores it on mount", async () => {
    vi.useFakeTimers();
    const { form } = mountForm();
    fill(form, { lastName: "Prikhodko", message: "Hello" });
    form
      .querySelector<HTMLInputElement>('[name="lastName"]')
      ?.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(400);
    expect(sessionStorage.getItem("dp.request-draft")).toContain("Prikhodko");

    const { form: restored } = mountForm();
    expect(restored.querySelector<HTMLInputElement>('[name="lastName"]')?.value).toBe("Prikhodko");
  });

  it("ignores honeypot submissions and shows a fake success", () => {
    const { form, success, status } = mountForm();
    fill(form, { website: "https://spam.invalid" });
    submit(form);
    expect(success.hidden).toBe(false);
    expect(status.textContent).toBe("");
  });

  it("delivers a valid request and swaps to the success panel", async () => {
    vi.spyOn(MailtoGateway.prototype, "send").mockResolvedValue({
      ok: true,
      messageKey: "form.result.mailto",
    });
    const { form, success, status } = mountForm();
    fill(form, {
      lastName: "Prikhodko",
      firstName: "Dmitrii",
      phone: "+598 96 671 725",
      consent: "on",
      message: "Need a SCADA engineer",
    });
    const consent = form.querySelector<HTMLInputElement>('[name="consent"]');
    if (consent) consent.checked = true;

    submit(form);
    await vi.waitFor(() => expect(success.hidden).toBe(false));
    expect(status.textContent).toBe("");
    expect(sessionStorage.getItem("dp.request-draft")).toBeNull();

    document.querySelector<HTMLButtonElement>('[data-js="reset"]')?.click();
    expect(success.hidden).toBe(true);
    expect(form.hidden).toBe(false);
  });
});
