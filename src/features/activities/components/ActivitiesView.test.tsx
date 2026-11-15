import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import ActivitiesView from "./ActivitiesView";

beforeEach(() => localStorage.clear());

describe("Atividades", () => {
  it("tem o Respirar entre as atividades, levando ao exercício guiado", () => {
    render(
      <UndoProvider>
        <ActivitiesView />
      </UndoProvider>,
    );
    const link = screen.getByRole("link", { name: /Respirar um minuto/ });
    expect(link).toHaveAttribute("href", "/dashboard/breathing");
  });
});

describe("Atividades em blocos", () => {
  it("mostra o pedido com o prazo, sem culpa, e o que já mudou no termômetro", async () => {
    const { ASSIGNMENTS_KEY, ACTIVITIES_KEY } = await import("../hooks/useActivities");
    const { toISODate } = await import("@/lib/dates");
    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    localStorage.setItem(
      ASSIGNMENTS_KEY,
      JSON.stringify([
        {
          id: "p1",
          kind: "sleep",
          by: "Dra. Helena",
          assignedAt: toISODate(new Date()),
          dueDate: toISODate(inTwoDays),
        },
        { id: "p2", kind: "values", by: "Dra. Helena", assignedAt: "2026-10-01", doneRecordId: "r1" },
      ]),
    );
    localStorage.setItem(
      ACTIVITIES_KEY,
      JSON.stringify([
        { id: "r1", kind: "values", date: "2026-10-02", answers: { chosen: ["Família"] } },
        {
          id: "r2",
          kind: "thermometer",
          date: "2026-10-25",
          answers: { feeling: "medo", before: 8, after: 5 },
        },
      ]),
    );
    render(
      <UndoProvider>
        <ActivitiesView />
      </UndoProvider>,
    );

    const pedidos = screen.getByRole("region", { name: "Pedidas pelos seus profissionais" });
    expect(pedidos).toHaveTextContent("Diário do sono");
    expect(pedidos).toHaveTextContent("faltam 2 dias");
    expect(screen.getByRole("img", { name: "1 de 2 pedidos feitos" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Quanto pesava: antes 8, depois 5, de 10" })).toBeInTheDocument();
  });
});
