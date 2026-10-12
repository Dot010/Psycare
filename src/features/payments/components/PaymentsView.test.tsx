import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PaymentsView from "./PaymentsView";

describe("PaymentsView", () => {
  it("separa as cobranças por profissional e não fala em assinatura", () => {
    render(<PaymentsView />);
    expect(screen.getByRole("region", { name: "Dra. Helena Prado" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Dr. Rafael Nunes" })).toBeInTheDocument();
    expect(screen.queryByText(/assinatura|plano/i)).toBeNull();
  });

  it("só oferece pagar o que está pendente, e o PIX é daquele profissional", async () => {
    render(<PaymentsView />);
    const helena = screen.getByRole("region", { name: "Dra. Helena Prado" });
    expect(within(helena).getAllByText("Pago")).toHaveLength(2);
    await userEvent.click(within(helena).getByRole("button", { name: "Pagar Dra. Helena Prado via PIX" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Pagar Dra. Helena Prado");
    expect(screen.getByRole("dialog")).toHaveTextContent("Não pague nada com eles");
  });

  it("o profissional sem pendência aparece em dia", () => {
    render(<PaymentsView />);
    const rafael = screen.getByRole("region", { name: "Dr. Rafael Nunes" });
    expect(within(rafael).getByText("Em dia")).toBeInTheDocument();
    expect(within(rafael).queryByRole("button", { name: /Pagar/ })).toBeNull();
  });
});
