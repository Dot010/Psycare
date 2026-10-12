import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundView } from "./NotFoundView";

describe("NotFoundView", () => {
  it("leva quem está logado de volta ao painel", () => {
    render(<NotFoundView signedIn homeHref="/dashboard/pro" />);
    expect(screen.getByRole("heading", { name: "Não achamos essa página." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
      "href",
      "/dashboard/pro",
    );
  });

  it("leva quem não entrou ao login", () => {
    render(<NotFoundView signedIn={false} />);
    expect(screen.getByRole("link", { name: "Ir para o login" })).toHaveAttribute("href", "/login");
  });
});
