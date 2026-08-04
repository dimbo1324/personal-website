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
  it("renders the heading", () => {
    renderWithIntl();
    expect(screen.getByRole("heading", { name: messages.home.heading })).toBeInTheDocument();
  });

  it("renders a contact link", () => {
    renderWithIntl();
    expect(screen.getByRole("link", { name: messages.home.cta })).toHaveAttribute(
      "href",
      "mailto:dimaprihodko180@gmail.com",
    );
  });
});
