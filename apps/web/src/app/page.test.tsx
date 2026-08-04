import { render, screen } from "@testing-library/react";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders the heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Dmitry Prikhodko" })).toBeInTheDocument();
  });

  it("renders a contact link", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "mailto:dimaprihodko180@gmail.com",
    );
  });
});
