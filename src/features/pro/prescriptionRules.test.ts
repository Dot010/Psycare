import { describe, expect, it } from "vitest";
import { detectChange, draftFrom, latestPerMedicine, lifecycle, needsAttention } from "./prescriptionRules";
import type { Prescription } from "./types";

const base: Prescription = {
  id: "r1",
  patientId: "p1",
  nome: "Sertralina",
  dosagem: "50 mg",
  kind: "common",
  consultationDate: "2026-09-01",
  useFrom: "2026-09-01",
  useUntil: "2026-10-01",
  status: "issued",
  change: "none",
};

describe("lifecycle", () => {
  it("emitida enquanto o prazo não passou", () => {
    expect(lifecycle(base, "2026-09-20")).toBe("issued");
    expect(lifecycle(base, "2026-10-01")).toBe("issued");
  });
  it("vencida depois do último dia de uso", () => {
    expect(lifecycle(base, "2026-10-02")).toBe("expired");
  });
  it("usada e suspensa valem mesmo com prazo vencido", () => {
    expect(lifecycle({ ...base, status: "used" }, "2026-12-01")).toBe("used");
    expect(lifecycle({ ...base, status: "stopped" }, "2026-12-01")).toBe("stopped");
  });
});

describe("detectChange", () => {
  it("sem receita anterior não há mudança", () => {
    expect(detectChange(undefined, base)).toBe("none");
  });
  it("dose diferente é mudança de dose", () => {
    expect(detectChange(base, { nome: "Sertralina", dosagem: "100 mg" })).toBe("dose");
  });
  it("remédio diferente é troca, ignorando maiúsculas e espaços", () => {
    expect(detectChange(base, { nome: " escitalopram ", dosagem: "50 mg" })).toBe("switch");
    expect(detectChange(base, { nome: " SERTRALINA ", dosagem: "50 mg" })).toBe("none");
  });
});

describe("latestPerMedicine", () => {
  it("fica com a mais nova de cada remédio do mesmo paciente", () => {
    const newer = { ...base, id: "r2", consultationDate: "2026-10-01" };
    const other = { ...base, id: "r3", patientId: "p2" };
    const ids = latestPerMedicine([base, newer, other]).map((p) => p.id);
    expect(ids.sort()).toEqual(["r2", "r3"]);
  });
});

describe("needsAttention", () => {
  it("emitida com folga não precisa", () => {
    expect(needsAttention(base, "2026-09-10")).toBe(false);
  });
  it("vence em até 5 dias, já usada ou vencida precisam", () => {
    expect(needsAttention(base, "2026-09-26")).toBe(true);
    expect(needsAttention({ ...base, status: "used" }, "2026-09-10")).toBe(true);
    expect(needsAttention(base, "2026-10-05")).toBe(true);
  });
  it("suspensa nunca precisa", () => {
    expect(needsAttention({ ...base, status: "stopped" }, "2026-12-01")).toBe(false);
  });
});

describe("draftFrom", () => {
  it("copia a última e põe a consulta de hoje", () => {
    const d = draftFrom(base, "2026-10-09");
    expect(d).toMatchObject({
      nome: "Sertralina",
      dosagem: "50 mg",
      kind: "common",
      consultationDate: "2026-10-09",
    });
    expect(d.useFrom).toBe("2026-10-09");
    expect(d.useUntil).toBe("2026-11-08");
  });
});
