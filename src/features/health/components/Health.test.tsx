import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DoseItem } from "../logic";
import { DoseTimeline } from "./DoseTimeline";
import { SymptomLogger } from "./SymptomLogger";

const dose: DoseItem = {
  key: "m1|2026-10-08|08:00",
  medId: "m1",
  nome: "Sertralina",
  dosagem: "50 mg",
  time: "08:00",
  period: "Manhã",
};

describe("DoseTimeline", () => {
  it("marca e mostra o estado da dose", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(<DoseTimeline doses={[dose]} taken={[]} onToggle={onToggle} />);
    const button = screen.getByRole("button", { name: /Marcar como tomado: Sertralina/ });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith(dose);
    rerender(<DoseTimeline doses={[dose]} taken={[dose.key]} onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: /Desmarcar Sertralina/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("SymptomLogger", () => {
  it("só pede intensidade depois de escolher um sintoma e registra", async () => {
    const onLog = vi.fn();
    render(<SymptomLogger onLog={onLog} />);
    expect(screen.queryByRole("radiogroup", { name: "Intensidade" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Insônia" }));
    await userEvent.click(screen.getByRole("radio", { name: /4 de 5/ }));
    await userEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(onLog).toHaveBeenCalledWith(["Insônia"], 4);
    expect(screen.getByRole("status")).toHaveTextContent(/Anotado/);
  });

  it("aceita um sintoma digitado", async () => {
    const onLog = vi.fn();
    render(<SymptomLogger onLog={onLog} />);
    await userEvent.type(screen.getByLabelText("Outro sintoma"), "Tontura");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await userEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(onLog).toHaveBeenCalledWith(["Tontura"], 3);
  });
});
