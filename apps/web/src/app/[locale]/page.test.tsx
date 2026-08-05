import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import messages from "../../../messages/ru.json";
import HomePage from "./page";

function renderWithIntl() {
  return render(
    <NextIntlClientProvider locale="ru" messages={messages}>
      <HomePage />
    </NextIntlClientProvider>,
  );
}

describe("HomePage", () => {
  it("renders the hero heading", () => {
    renderWithIntl();
    expect(screen.getByRole("heading", { name: /Инженерные решения/ })).toBeInTheDocument();
  });

  it("renders a contact form", () => {
    renderWithIntl();
    expect(screen.getByRole("button", { name: "Отправить" })).toBeInTheDocument();
  });
});
