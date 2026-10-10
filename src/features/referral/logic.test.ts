import { describe, expect, it } from "vitest";
import { canRequest, currentFor, isOpen, parseAuthorization, referralTasks, stageOf } from "./logic";
import type { Referral } from "./types";

const ref = (id: string, extra: Partial<Referral> = {}): Referral => ({
  id,
  patientId: "p",
  requestedAt: "2026-10-01",
  reminders: [],
  ...extra,
});

describe("stageOf", () => {
  it("segue as datas preenchidas", () => {
    expect(stageOf(ref("a"))).toBe("requested");
    expect(stageOf(ref("a", { issuedAt: "2026-10-02" }))).toBe("issued");
    expect(stageOf(ref("a", { issuedAt: "x", authorizedAt: "y" }))).toBe("authorized");
    expect(stageOf(ref("a", { issuedAt: "x", authorizedAt: "y", deliveredAt: "z" }))).toBe("delivered");
  });
});

describe("pedido", () => {
  it("só pede de novo quando não há um em andamento", () => {
    expect(canRequest([], "p")).toBe(true);
    expect(canRequest([ref("a")], "p")).toBe(false);
    expect(canRequest([ref("a", { issuedAt: "x", authorizedAt: "y", deliveredAt: "z" })], "p")).toBe(true);
    expect(canRequest([ref("a", { canceled: true })], "p")).toBe(true);
  });
  it("o atual é o mais recente que não foi cancelado", () => {
    const list = [
      ref("a", { requestedAt: "2026-09-01" }),
      ref("b", { requestedAt: "2026-10-01" }),
      ref("c", { canceled: true, requestedAt: "2026-10-05" }),
    ];
    expect(currentFor(list, "p")?.id).toBe("b");
    expect(isOpen(ref("a", { deliveredAt: "z" }))).toBe(false);
  });
});

describe("parseAuthorization", () => {
  it("aceita convênio e sessões válidos", () => {
    expect(parseAuthorization("  Unimed   Exemplo ", "12")).toEqual({
      insurance: "Unimed Exemplo",
      sessions: 12,
    });
  });
  it("recusa sem convênio, sessões zero, quebradas ou em excesso", () => {
    expect(parseAuthorization("", "12")).toBeNull();
    expect(parseAuthorization("Unimed", "0")).toBeNull();
    expect(parseAuthorization("Unimed", "2,5")).toBeNull();
    expect(parseAuthorization("Unimed", "61")).toBeNull();
  });
});

describe("referralTasks (Meu dia)", () => {
  it("emitido gera 'Levar ao convênio'; autorizado gera 'Levar à psicóloga'", () => {
    expect(referralTasks([ref("a", { issuedAt: "x" })], "p", "2026-10-09")[0]).toMatchObject({
      title: "Levar o encaminhamento ao convênio",
      source: "encaminhamento",
      readonly: true,
    });
    expect(referralTasks([ref("a", { issuedAt: "x", authorizedAt: "y" })], "p", "2026-10-09")[0].title).toBe(
      "Levar o encaminhamento à psicóloga",
    );
  });
  it("pedido ainda não emitido, entregue ou sem encaminhamento: nenhuma tarefa", () => {
    expect(referralTasks([ref("a")], "p", "2026-10-09")).toEqual([]);
    expect(
      referralTasks([ref("a", { issuedAt: "x", authorizedAt: "y", deliveredAt: "z" })], "p", "2026-10-09"),
    ).toEqual([]);
    expect(referralTasks([], "p", "2026-10-09")).toEqual([]);
  });
});
