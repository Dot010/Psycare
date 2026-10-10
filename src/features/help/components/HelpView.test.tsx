import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HelpView from "./HelpView";

describe("Ajuda", () => {
  it("tem os telefones de crise e perguntas sobre o app, sem contatos que não existem", () => {
    render(<HelpView />);
    expect(screen.getByRole("link", { name: "188" })).toHaveAttribute("href", "tel:188");
    expect(screen.getByText("Quem lê o meu diário?")).toBeInTheDocument();
    expect(screen.getByText("Como o jardim cresce?")).toBeInTheDocument();
    expect(screen.queryByText("Chat de suporte")).not.toBeInTheDocument();
    expect(screen.queryByText("Base de conhecimento")).not.toBeInTheDocument();
  });
});
