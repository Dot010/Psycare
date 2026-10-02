import { describe, expect, it } from "vitest";
import { nextAppointment, splitAppointments } from "./logic";
import type { Agendamento } from "./types";

const item = (
  id: string,
  data: string,
  hora: string,
  status: Agendamento["status"] = "confirmado",
): Agendamento => ({
  id,
  profissional: "Dra. X",
  data,
  hora,
  status,
  tipo: "online",
});

const NOW = "2026-10-02T12:00";

describe("appointments logic", () => {
  it("separa próximas de anteriores e ordena cada grupo", () => {
    const { upcoming, past } = splitAppointments(
      [item("c", "2026-10-20", "10:00"), item("a", "2026-09-08", "15:30"), item("b", "2026-10-15", "09:00")],
      NOW,
    );
    expect(upcoming.map((i) => i.id)).toEqual(["b", "c"]);
    expect(past.map((i) => i.id)).toEqual(["a"]);
  });

  it("consulta cancelada vai para o histórico mesmo no futuro", () => {
    const { upcoming, past } = splitAppointments([item("x", "2026-11-01", "10:00", "cancelado")], NOW);
    expect(upcoming).toHaveLength(0);
    expect(past).toHaveLength(1);
  });

  it("no mesmo dia, compara pelo horário", () => {
    expect(
      nextAppointment([item("m", "2026-10-02", "09:00"), item("t", "2026-10-02", "18:00")], NOW)?.id,
    ).toBe("t");
  });

  it("sem consultas futuras não há próxima", () => {
    expect(nextAppointment([item("a", "2026-01-01", "10:00")], NOW)).toBeUndefined();
  });
});
