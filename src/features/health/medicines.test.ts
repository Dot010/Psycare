import { describe, expect, it } from "vitest";
import type { Prescription } from "@/features/pro/types";
import { medicinesFor, timesFromText } from "./medicines";
import type { Medicamento } from "./types";

const rx = (nome: string, extra: Partial<Prescription> = {}): Prescription => ({
  id: `r-${nome}`,
  patientId: "p",
  nome,
  dosagem: "50 mg, 1 comprimido pela manhã",
  kind: "common",
  origin: { type: "consultation", consultationId: "c" },
  preparedAt: "2026-10-01",
  useFrom: "2026-10-01",
  useUntil: "2026-11-01",
  status: "ready",
  change: "none",
  ...extra,
});
const saved = (nome: string): Medicamento => ({
  id: nome,
  nome,
  dosagem: "70mg",
  frequencia: "Diária",
  horario: "08:00",
});

describe("timesFromText", () => {
  it("entende o período do dia", () => {
    expect(timesFromText("1 comprimido pela manhã")).toEqual(["08:00"]);
    expect(timesFromText("1 cápsula à noite")).toEqual(["20:00"]);
    expect(timesFromText("antes de dormir")).toEqual(["22:00"]);
    expect(timesFromText("2 vezes ao dia")).toEqual(["08:00", "20:00"]);
  });
  it("sem pista devolve vazio", () => {
    expect(timesFromText("conforme orientação")).toEqual([]);
  });
});

describe("medicinesFor", () => {
  it("remédio novo do psiquiatra entra na lista com horário estimado", () => {
    const list = medicinesFor([saved("Lyberdia")], [rx("Lyberdia"), rx("Sertralina")], "p");
    expect(list.map((m) => m.nome)).toEqual(["Lyberdia", "Sertralina"]);
    expect(list[1]).toMatchObject({ id: "rx-sertralina", dosagem: "50 mg", horarios: ["08:00"] });
  });
  it("mantém o cadastro que já existe, sem duplicar", () => {
    const list = medicinesFor([saved("Lyberdia")], [rx("lyberdia")], "p");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("Lyberdia");
  });
  it("remédio suspenso sai da lista", () => {
    const list = medicinesFor([saved("Lyberdia")], [rx("Lyberdia", { status: "stopped" })], "p");
    expect(list).toEqual([]);
  });
  it("só olha as receitas do paciente", () => {
    expect(medicinesFor([], [rx("Sertralina", { patientId: "outro" })], "p")).toEqual([]);
  });
  it("usa a receita mais recente de cada remédio", () => {
    const old = rx("Sertralina", { id: "old", preparedAt: "2026-08-01", status: "stopped" });
    const list = medicinesFor([], [old, rx("Sertralina")], "p");
    expect(list.map((m) => m.nome)).toEqual(["Sertralina"]);
  });
});
