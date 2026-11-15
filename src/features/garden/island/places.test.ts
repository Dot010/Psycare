import { describe, expect, it } from "vitest";
import {
  cleanFoxName,
  foxRef,
  grassPatch,
  heightAt,
  keepOnIsland,
  mergeUnlocks,
  OBSTACLES,
  PLACES,
  SAND_EDGE,
  seasonFor,
  unlocksFor,
  WALK_RADIUS,
} from "@/features/garden/island/places";

describe("lugares da ilha", () => {
  it("cada lugar abre uma página do app e tem id único", () => {
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length);
    expect(PLACES.every((p) => p.href.startsWith("/dashboard/"))).toBe(true);
  });

  it("o farol leva ao plano de segurança", () => {
    expect(PLACES.find((p) => p.id === "farol")?.href).toBe("/dashboard/safety");
  });

  it("as paradas da raposa ficam dentro da ilha", () => {
    for (const place of PLACES) expect(Math.hypot(...place.stop)).toBeLessThanOrEqual(WALK_RADIUS);
  });
});

describe("andar na ilha", () => {
  it("traz de volta quem sai da borda", () => {
    const [x, z] = keepOnIsland(30, 0);
    expect(Math.hypot(x, z)).toBeCloseTo(WALK_RADIUS);
  });

  it("empurra para fora de um obstáculo", () => {
    const o = OBSTACLES[0];
    const [x, z] = keepOnIsland(o.x + 0.1, o.z);
    expect(Math.hypot(x - o.x, z - o.z)).toBeGreaterThanOrEqual(o.r);
  });

  it("o chão é mais baixo na borda do que no meio pode ser", () => {
    expect(heightAt(12, 0)).toBeCloseTo(1.8);
  });
});

describe("estações (hemisfério sul)", () => {
  it.each([
    [0, "verao"],
    [3, "outono"],
    [6, "inverno"],
    [10, "primavera"],
    [11, "verao"],
  ] as const)("mês %i é %s", (month, season) => {
    expect(seasonFor(new Date(2026, month, 10))).toBe(season);
  });
});

describe("a ilha cresce com o uso", () => {
  it("começa sem nada a mais", () => {
    expect(unlocksFor({ careDays: 0, grownPlants: 0, trips: 0 })).toEqual([]);
  });

  it("dias de cuidado, plantas crescidas e travessias trazem coisas novas", () => {
    expect(unlocksFor({ careDays: 3, grownPlants: 1, trips: 2 })).toEqual([
      "banco",
      "lanternas",
      "ninho",
      "bandeirinhas",
    ]);
  });

  it("o que apareceu não some, mesmo se os números caírem", () => {
    expect(mergeUnlocks(["banco", "ninho"], [])).toEqual(["banco", "ninho"]);
    expect(mergeUnlocks(["banco"], ["lanternas"])).toEqual(["banco", "lanternas"]);
  });

  it("ignora nomes que não existem", () => {
    expect(mergeUnlocks(["castelo"], [])).toEqual([]);
  });
});

describe("nome da raposa", () => {
  it("limpa espaços e põe a primeira letra maiúscula", () => {
    expect(cleanFoxName("  mel   da  ilha ")).toBe("Mel da ilha");
  });

  it("corta em 16 letras", () => {
    expect(cleanFoxName("a".repeat(40))).toHaveLength(16);
  });

  it("recusa HTML e números", () => {
    expect(cleanFoxName("<b>Mel</b>")).toBeNull();
    expect(cleanFoxName("Mel2")).toBeNull();
  });

  it("vazio é permitido (fica 'a raposa')", () => {
    expect(cleanFoxName("   ")).toBe("");
    expect(foxRef("")).toBe("a raposa");
    expect(foxRef("Mel")).toBe("a Mel");
  });
});

describe("manchas de grama", () => {
  it("tem grama e caminhos de areia, sempre no mesmo lugar", () => {
    let grass = 0;
    let total = 0;
    for (let x = -11; x <= 11; x += 1)
      for (let z = -11; z <= 11; z += 1) {
        if (Math.hypot(x, z) > 11) continue;
        total++;
        if (grassPatch(x, z) >= SAND_EDGE) grass++;
      }
    expect(grass / total).toBeGreaterThan(0.5);
    expect(grass / total).toBeLessThan(0.95);
    expect(grassPatch(3, -2)).toBe(grassPatch(3, -2));
  });
});
