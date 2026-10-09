import { describe, expect, it } from "vitest";
import {
  detectChange,
  draftFrom,
  eligibleConsultations,
  latestPerMedicine,
  lifecycle,
  needsAttention,
  pendingPrescription,
  nextStep,
  requestStage,
} from "./prescriptionRules";
import type { Consultation, Prescription } from "./types";

const base: Prescription = {
  id: "r1",
  patientId: "p1",
  nome: "Sertralina",
  dosagem: "50 mg",
  kind: "common",
  origin: { type: "consultation", consultationId: "c0" },
  preparedAt: "2026-09-01",
  useFrom: "2026-09-01",
  useUntil: "2026-10-01",
  status: "ready",
  change: "none",
};

describe("lifecycle", () => {
  it("pronta enquanto o prazo não passou", () => {
    expect(lifecycle(base, "2026-09-20")).toBe("ready");
    expect(lifecycle(base, "2026-10-01")).toBe("ready");
  });
  it("vencida depois do último dia de uso", () => {
    expect(lifecycle(base, "2026-10-02")).toBe("expired");
  });
  it("suspensa vale mesmo com prazo vencido", () => {
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
    const newer = { ...base, id: "r2", preparedAt: "2026-10-01" };
    const other = { ...base, id: "r3", patientId: "p2" };
    const ids = latestPerMedicine([base, newer, other]).map((p) => p.id);
    expect(ids.sort()).toEqual(["r2", "r3"]);
  });
});

describe("needsAttention", () => {
  it("pronta com folga não precisa", () => {
    expect(needsAttention(base, "2026-09-10")).toBe(false);
  });
  it("vence em até 5 dias ou já venceu: precisa", () => {
    expect(needsAttention(base, "2026-09-26")).toBe(true);
    expect(needsAttention(base, "2026-10-05")).toBe(true);
  });
  it("faltando 6 dias ainda não precisa", () => {
    expect(needsAttention(base, "2026-09-25")).toBe(false);
  });
  it("suspensa nunca precisa", () => {
    expect(needsAttention({ ...base, status: "stopped" }, "2026-12-01")).toBe(false);
  });
});

describe("pendingPrescription", () => {
  const list = [base];
  it("pronta e ainda não comprada aparece", () => {
    expect(pendingPrescription(list, "p1", "sertralina", {}, "2026-09-20")?.id).toBe("r1");
    expect(pendingPrescription(list, "p1", "Sertralina", { r1: "retirei" }, "2026-09-20")?.id).toBe("r1");
  });
  it("depois de comprada some", () => {
    expect(pendingPrescription(list, "p1", "Sertralina", { r1: "comprei" }, "2026-09-20")).toBeUndefined();
  });
  it("vencida ou suspensa não aparece", () => {
    expect(pendingPrescription(list, "p1", "Sertralina", {}, "2026-10-05")).toBeUndefined();
    expect(
      pendingPrescription([{ ...base, status: "stopped" }], "p1", "Sertralina", {}, "2026-09-20"),
    ).toBeUndefined();
  });
  it("só olha o paciente e o remédio pedidos", () => {
    expect(pendingPrescription(list, "outro", "Sertralina", {}, "2026-09-20")).toBeUndefined();
    expect(pendingPrescription(list, "p1", "Lyberdia", {}, "2026-09-20")).toBeUndefined();
  });
  it("com duas receitas olha a mais recente", () => {
    const newer = { ...base, id: "r2", preparedAt: "2026-09-15", useUntil: "2026-10-15" };
    expect(pendingPrescription([base, newer], "p1", "Sertralina", { r1: "comprei" }, "2026-09-20")?.id).toBe(
      "r2",
    );
  });
});

const consult = (
  id: string,
  patientId: string,
  date: string,
  status: Consultation["status"] = "realizada",
): Consultation => ({
  id,
  patientId,
  date,
  hora: "10:00",
  status,
});

describe("eligibleConsultations", () => {
  const list = [
    consult("c0", "p1", "2026-09-01"),
    consult("c1", "p1", "2026-09-20"),
    consult("c2", "p1", "2026-10-09", "confirmado"),
    consult("c3", "p1", "2026-10-20", "confirmado"),
    consult("c4", "p2", "2026-09-25"),
  ];

  it("só consultas do paciente, depois da última receita e que já aconteceram", () => {
    expect(eligibleConsultations(list, base, "2026-10-09").map((c) => c.id)).toEqual(["c2", "c1"]);
  });
  it("a consulta da receita anterior não serve de novo", () => {
    expect(eligibleConsultations(list, base, "2026-09-10").map((c) => c.id)).toEqual([]);
  });
  it("sem consulta nova, não há como registrar", () => {
    expect(eligibleConsultations([consult("c4", "p2", "2026-09-25")], base, "2026-10-09")).toEqual([]);
  });
});

describe("draftFrom", () => {
  it("copia a última e começa a valer no dia dado", () => {
    const d = draftFrom(base, "2026-10-09");
    expect(d).toMatchObject({ nome: "Sertralina", dosagem: "50 mg", kind: "common", useFrom: "2026-10-09" });
    expect(d.useUntil).toBe("2026-11-08");
  });
});

describe("requestStage", () => {
  it("sem resposta, o pedido está enviado", () => {
    expect(requestStage({})).toBe("sent");
  });
  it("com resposta, vale o que o médico respondeu", () => {
    expect(requestStage({ answer: { kind: "consult", at: "2026-10-09" } })).toBe("consult");
  });
});

describe("nextStep", () => {
  it("vai de nada a retirei, de retirei a comprei, e acaba", () => {
    expect(nextStep(undefined)).toBe("retirei");
    expect(nextStep("retirei")).toBe("comprei");
    expect(nextStep("comprei")).toBeUndefined();
  });
});
