import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { MessagesView } from "./MessagesView";

beforeEach(() => localStorage.clear());

describe("Mensagens do paciente", () => {
  it("tem uma conversa com cada profissional, com atalhos da especialidade", async () => {
    render(<MessagesView />);
    expect(screen.getByRole("button", { name: "Algo aconteceu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dúvida remédio" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Dr\. Rafael Nunes/ }));
    expect(screen.getByRole("button", { name: "Dúvida remédio" })).toBeInTheDocument();
  });
});
