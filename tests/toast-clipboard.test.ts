// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyToClipboard } from "../src/scripts/site/services/clipboard";
import { Toast } from "../src/scripts/site/services/toast";
import { I18nService } from "../src/scripts/site/i18n/service";
import en from "../src/scripts/site/i18n/locales/en";
import es from "../src/scripts/site/i18n/locales/es";
import ru from "../src/scripts/site/i18n/locales/ru";
import { setBody } from "./helpers/dom";

const i18n = new I18nService({ dictionaries: { en, es, ru }, initial: "en" });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("Toast", () => {
  it("shows an icon and message, then hides after the timeout", () => {
    vi.useFakeTimers();
    setBody('<div data-js="toast"></div>');
    const element = document.querySelector<HTMLElement>("[data-js=toast]");
    if (!element) throw new Error("missing fixture");
    const toast = new Toast(element);

    toast.show("Copied: a@b.com");
    expect(element.classList.contains("is-visible")).toBe(true);
    expect(element.textContent).toBe("Copied: a@b.com");
    expect(element.querySelector("use")?.getAttribute("href")).toContain("i-check");

    vi.advanceTimersByTime(2400);
    expect(element.classList.contains("is-visible")).toBe(false);
  });
});

describe("CopyToClipboard", () => {
  it("uses the async clipboard API and reports success", async () => {
    vi.useFakeTimers();
    setBody('<div data-js="toast"></div><button data-copy="a@b.com"></button>');
    const toastElement = document.querySelector<HTMLElement>("[data-js=toast]");
    const button = document.querySelector<HTMLButtonElement>("[data-copy]");
    if (!toastElement || !button) throw new Error("missing fixtures");

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    new CopyToClipboard(new Toast(toastElement), i18n).bind([button]);
    button.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(writeText).toHaveBeenCalledWith("a@b.com");
    expect(toastElement.textContent).toBe("Copied: a@b.com");
  });

  it("falls back to execCommand when the async API fails", async () => {
    setBody('<div data-js="toast"></div>');
    const toastElement = document.querySelector<HTMLElement>("[data-js=toast]");
    if (!toastElement) throw new Error("missing fixture");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) },
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    await new CopyToClipboard(new Toast(toastElement), i18n).copy("secret");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(toastElement.textContent).toBe("Copied: secret");
  });

  it("does nothing for an empty value", async () => {
    setBody('<div data-js="toast"></div>');
    const toastElement = document.querySelector<HTMLElement>("[data-js=toast]");
    if (!toastElement) throw new Error("missing fixture");
    const toast = new Toast(toastElement);
    const show = vi.spyOn(toast, "show");
    await new CopyToClipboard(toast, i18n).copy(undefined);
    expect(show).not.toHaveBeenCalled();
  });
});
