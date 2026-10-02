import { describe, expect, it } from "vitest";
import {
  addDrop,
  careStreak,
  dropId,
  dropsToNextPlant,
  gardenPlants,
  lastDays,
} from "@/features/garden/logic";
import type { WaterDrop } from "@/features/garden/types";

const drop = (date: string, source: WaterDrop["source"] = "checkin", ref?: string): WaterDrop => ({
  id: dropId(source, date, ref),
  source,
  date,
});

describe("garden logic", () => {
  it("começa só com o girassol brotando", () => {
    const plants = gardenPlants(0);
    expect(plants.map((p) => p.kind)).toEqual(["sunflower"]);
    expect(plants[0].growth).toBeGreaterThan(0);
  });

  it("novas plantas aparecem com mais gotas e a planta cresce até 1", () => {
    expect(gardenPlants(6).map((p) => p.kind)).toEqual(["sunflower", "daisy"]);
    expect(gardenPlants(100).every((p) => p.growth === 1)).toBe(true);
    expect(gardenPlants(100)).toHaveLength(4);
  });

  it("informa quantas gotas faltam para a próxima planta", () => {
    expect(dropsToNextPlant(4)).toBe(2);
    expect(dropsToNextPlant(100)).toBeNull();
  });

  it("não repete a gota da mesma ação no mesmo dia", () => {
    const first = addDrop([], drop("2026-10-02"));
    expect(addDrop(first, drop("2026-10-02"))).toBe(first);
    expect(addDrop(first, drop("2026-10-03"))).toHaveLength(2);
    expect(addDrop(first, drop("2026-10-02", "habit", "h1"))).toHaveLength(2);
  });

  it("resume os últimos dias", () => {
    const days = lastDays([drop("2026-10-02"), drop("2026-10-02", "diary")], "2026-10-02", 3);
    expect(days.map((d) => d.count)).toEqual([0, 0, 2]);
    expect(days[0].date).toBe("2026-09-30");
  });

  it("conta dias seguidos sem zerar quando hoje ainda está em aberto", () => {
    const drops = [drop("2026-10-01"), drop("2026-09-30"), drop("2026-09-28")];
    expect(careStreak(drops, "2026-10-02")).toBe(2);
    expect(careStreak([...drops, drop("2026-10-02")], "2026-10-02")).toBe(3);
    expect(careStreak([], "2026-10-02")).toBe(0);
  });
});
