import { describe, expect, it } from "vitest";
import { groupByProfessional, totalOpen } from "./logic";
import type { Charge } from "./types";

const c = (
  id: string,
  professionalId: string,
  date: string,
  status: Charge["status"],
  amount = 100,
): Charge => ({
  id,
  professionalId,
  description: "Sessão",
  date,
  amount,
  status,
});

describe("groupByProfessional", () => {
  const charges = [
    c("1", "pro_psi_01", "2026-09-08", "paid"),
    c("2", "pro_psi_01", "2026-10-06", "pending", 180),
    c("3", "pro_med_01", "2026-09-15", "pending", 250),
  ];

  it("separa por profissional, da cobrança mais recente para a mais antiga", () => {
    const groups = groupByProfessional(charges);
    expect(groups.map((g) => g.professional.id)).toEqual(["pro_psi_01", "pro_med_01"]);
    expect(groups[0].charges.map((x) => x.id)).toEqual(["2", "1"]);
  });

  it("soma o em aberto de cada um separadamente", () => {
    const groups = groupByProfessional(charges);
    expect(groups.map((g) => g.open)).toEqual([180, 250]);
    expect(totalOpen(groups)).toBe(430);
  });

  it("não mostra quem não tem cobrança", () => {
    expect(
      groupByProfessional([c("1", "pro_med_01", "2026-09-15", "paid")]).map((g) => g.professional.id),
    ).toEqual(["pro_med_01"]);
    expect(groupByProfessional([])).toEqual([]);
  });

  it("ignora cobrança de profissional desconhecido", () => {
    expect(groupByProfessional([c("1", "pro_x", "2026-09-15", "pending")])).toEqual([]);
  });
});
