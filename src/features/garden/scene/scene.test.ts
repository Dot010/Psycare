import { describe, expect, it } from "vitest";
import { lerpHex, skyPalette } from "@/features/garden/scene/lighting";
import { BED_RADIUS, heightAt, seeded } from "@/features/garden/scene/heightmap";

describe("terreno", () => {
  it("é plano no canteiro e tem relevo longe dele", () => {
    expect(heightAt(0, 0)).toBe(0);
    expect(heightAt(BED_RADIUS - 0.1, 0)).toBe(0);
    const far = [10, 20, 30].map((d) => Math.abs(heightAt(d, -d)));
    expect(far.some((h) => h > 0.5)).toBe(true);
    expect(far.every(Number.isFinite)).toBe(true);
  });

  it("o gerador com semente repete a sequência", () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(a()).toBeGreaterThanOrEqual(0);
    expect(a()).toBeLessThan(1);
  });
});

describe("céu", () => {
  it("mistura cores", () => {
    expect(lerpHex("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(lerpHex("#102030", "#102030", 0.3)).toBe("#102030");
  });

  it("meio-dia é mais claro que o fim da tarde e a noite é escura", () => {
    const noon = skyPalette(12, false);
    const evening = skyPalette(17.5, false);
    const night = skyPalette(12, true);
    expect(noon.sunIntensity).toBeGreaterThan(evening.sunIntensity);
    expect(noon.lightPosition[1]).toBeGreaterThan(evening.lightPosition[1]);
    expect(night.top).toBe("#0d1220");
    expect(skyPalette(3, false)).toEqual(skyPalette(6, false));
  });
});
