import { describe, expect, it } from "vitest";
import {
  isMissionDone,
  MISSION_POOL,
  missionsForDay,
  missionSentence,
  NO_MISSIONS,
  toggleManual,
} from "./logic";

describe("missões do dia", () => {
  it("são três, distintas e estáveis no mesmo dia", () => {
    const a = missionsForDay("2026-10-08");
    expect(a).toHaveLength(3);
    expect(new Set(a.map((m) => m.id)).size).toBe(3);
    expect(missionsForDay("2026-10-08")).toEqual(a);
  });

  it("variam entre os dias", () => {
    const days = Array.from(
      { length: 14 },
      (_, i) => missionsForDay(`2026-10-${String(i + 1).padStart(2, "0")}`)[0].id,
    );
    expect(new Set(days).size).toBeGreaterThan(2);
  });

  it("missão automática segue a ação do app", () => {
    const checkin = MISSION_POOL.find((m) => m.id === "checkin")!;
    expect(isMissionDone(checkin, NO_MISSIONS, "2026-10-08", new Set(["checkin"]))).toBe(true);
    expect(isMissionDone(checkin, NO_MISSIONS, "2026-10-08", new Set())).toBe(false);
  });

  it("manual marca, desmarca e recomeça no dia seguinte", () => {
    const agua = MISSION_POOL.find((m) => m.id === "agua")!;
    const s1 = toggleManual(NO_MISSIONS, "agua", "2026-10-08");
    expect(isMissionDone(agua, s1, "2026-10-08", new Set())).toBe(true);
    expect(isMissionDone(agua, s1, "2026-10-09", new Set())).toBe(false);
    expect(toggleManual(s1, "agua", "2026-10-08").done).toEqual([]);
    expect(toggleManual(s1, "caminhar", "2026-10-09").done).toEqual(["caminhar"]);
  });

  it("frases sem cobrança", () => {
    expect(missionSentence(0, 3)).toMatch(/couberem/);
    expect(missionSentence(2, 3)).toBe("2 de 3. Cada um já conta.");
    expect(missionSentence(3, 3)).toMatch(/Tudo feito/);
  });
});
