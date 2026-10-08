import { describe, expect, it } from "vitest";
import { buildIcs, countdown, nextAppointment, splitAppointments, validateSlot } from "./logic";
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

describe("validateSlot", () => {
  const list = [item("a", "2026-10-10", "10:00"), item("b", "2026-10-11", "10:00", "cancelado")];

  it("recusa datas passadas", () => {
    expect(validateSlot({ data: "2026-10-01", hora: "10:00" }, list, NOW)).toMatch(/já passaram/);
    expect(validateSlot({ data: "2026-10-02", hora: "11:59" }, list, NOW)).toMatch(/já passaram/);
  });
  it("recusa conflito de horário, mas não com cancelada nem consigo mesma", () => {
    expect(validateSlot({ data: "2026-10-10", hora: "10:00" }, list, NOW)).toMatch(/Dra\. X/);
    expect(validateSlot({ data: "2026-10-11", hora: "10:00" }, list, NOW)).toBeNull();
    expect(validateSlot({ data: "2026-10-10", hora: "10:00" }, list, NOW, "a")).toBeNull();
  });
  it("recusa formato inválido", () => {
    expect(validateSlot({ data: "", hora: "10:00" }, list, NOW)).toMatch(/válidos/);
  });
});

describe("countdown", () => {
  const now = new Date(2026, 9, 2, 12, 0);
  it("fala em minutos, horas, amanhã e dias", () => {
    expect(countdown({ data: "2026-10-02", hora: "12:30" }, now)).toBe("Daqui a 30 min");
    expect(countdown({ data: "2026-10-02", hora: "15:00" }, now)).toBe("Hoje, daqui a 3 horas");
    expect(countdown({ data: "2026-10-03", hora: "09:00" }, now)).toBe("Amanhã");
    expect(countdown({ data: "2026-10-09", hora: "09:00" }, now)).toBe("Em 7 dias");
    expect(countdown({ data: "2026-10-02", hora: "11:00" }, now)).toBe("Agora");
  });
});

describe("buildIcs", () => {
  it("gera eventos de 1 hora com texto escapado", () => {
    const ics = buildIcs(
      [{ ...item("a", "2026-10-10", "10:00"), observacao: "falar de sono, trabalho" }],
      new Date(Date.UTC(2026, 9, 2, 15, 0)),
    );
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261010T100000");
    expect(ics).toContain("DTEND:20261010T110000");
    expect(ics).toContain("DTSTAMP:20261002T150000Z");
    expect(ics).toContain("SUMMARY:Sessão com Dra. X");
    expect(ics).toContain("falar de sono\\, trabalho");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
