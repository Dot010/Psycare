import { describe, expect, it } from "vitest";
import { dailyLevels } from "@/features/mood/logic";
import { appKeys, buildDemoData, buildExport, clearAll, exportFileName } from "./data";

function fakeStorage(initial: Record<string, string>) {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
  };
}

describe("exportar dados", () => {
  it("inclui só chaves do app e converte JSON", () => {
    const storage = fakeStorage({
      "psycare:diary:v1": JSON.stringify([{ id: "1" }]),
      "psycare:sound:v1": "true",
      "outro-site:x": "1",
      "psycare:texto": "não é json",
    });
    expect(appKeys(storage)).toEqual(["psycare:diary:v1", "psycare:sound:v1", "psycare:texto"]);
    const file = buildExport(storage, new Date("2026-10-08T12:00:00Z"));
    expect(file.app).toBe("PsyCare");
    expect(file.data["psycare:diary:v1"]).toEqual([{ id: "1" }]);
    expect(file.data["psycare:sound:v1"]).toBe(true);
    expect(file.data["psycare:texto"]).toBe("não é json");
    expect(file.data["outro-site:x"]).toBeUndefined();
  });

  it("nomeia o arquivo com a data", () => {
    expect(exportFileName(new Date(2026, 9, 8))).toBe("psycare-meus-dados-2026-10-08.json");
  });
});

describe("apagar dados", () => {
  it("remove só o que é do app", () => {
    window.localStorage.clear();
    window.localStorage.setItem("psycare:a", "1");
    window.localStorage.setItem("psycare:b", "2");
    window.localStorage.setItem("outro", "3");
    expect(clearAll(window.localStorage)).toBe(2);
    expect(window.localStorage.getItem("outro")).toBe("3");
    expect(window.localStorage.getItem("psycare:a")).toBeNull();
  });
});

describe("dados de exemplo", () => {
  it("gera registros recentes e válidos", () => {
    const { checkins, diary } = buildDemoData(new Date(2026, 9, 8));
    expect(checkins).toHaveLength(8);
    expect(new Set(checkins.map((c) => c.date)).size).toBe(8);
    expect(checkins.every((c) => c.date < "2026-10-08")).toBe(true);
    expect(diary).toHaveLength(3);
    expect(dailyLevels(checkins, diary).size).toBeGreaterThanOrEqual(8);
  });
});
