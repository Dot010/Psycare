import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza o filho como elemento único quando usado como link (asChild)", () => {
    render(
      <Button asChild>
        <a href="/destino">Ir</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Ir" })).toHaveAttribute("href", "/destino");
  });

  it("mostra o carregamento e bloqueia o clique", () => {
    render(<Button loading>Salvar</Button>);
    const button = screen.getByRole("button", { name: "Salvar" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
