import { describe, expect, it } from "vitest";
import { daysOfSupply, dosesTakenSince, isRunningLow, remainingUnits } from "./stock";

const taken = ["1|2026-10-01|08:00", "1|2026-10-02|08:00", "1|2026-10-03|08:00", "2|2026-10-03|20:00"];

describe("estoque", () => {
  it("conta só as doses do remédio, a partir do dia do estoque", () => {
    expect(dosesTakenSince(taken, "1", "2026-10-01")).toBe(3);
    expect(dosesTakenSince(taken, "1", "2026-10-02")).toBe(2);
    expect(dosesTakenSince(taken, "2", "2026-10-01")).toBe(1);
  });
  it("desconta as doses tomadas e nunca fica negativo", () => {
    expect(remainingUnits({ count: 30, since: "2026-10-01" }, taken, "1")).toBe(27);
    expect(remainingUnits({ count: 2, since: "2026-10-01" }, taken, "1")).toBe(0);
  });
  it("calcula os dias que o estoque dá", () => {
    expect(daysOfSupply(9, 1)).toBe(9);
    expect(daysOfSupply(9, 2)).toBe(4);
    expect(daysOfSupply(9, 0)).toBe(9);
  });
  it("avisa com 10 dias ou menos", () => {
    expect(isRunningLow(11)).toBe(false);
    expect(isRunningLow(10)).toBe(true);
    expect(isRunningLow(0)).toBe(true);
  });
});
