import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { demoPrescriptions } from "../data";
import { NewPrescriptionDialog } from "./NewPrescriptionDialog";

describe("NewPrescriptionDialog", () => {
  it("sem consulta e sem pedido, não deixa registrar e manda para a agenda", () => {
    const last = demoPrescriptions("2026-10-09")[0];
    render(
      <NewPrescriptionDialog
        patientName="Fulana"
        today="2026-10-09"
        last={last}
        consultations={[]}
        onClose={vi.fn()}
        onRegister={vi.fn()}
        onStop={vi.fn()}
      />,
    );
    expect(screen.getByText("Sem consulta para esta receita")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Registrar receita" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir a agenda" })).toHaveAttribute(
      "href",
      "/dashboard/pro/agenda",
    );
  });
});
