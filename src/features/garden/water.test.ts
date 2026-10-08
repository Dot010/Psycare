import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POURED_KEY, WATER_KEY, grantWater, pourWater, readPoured } from "@/features/garden/water";
import { readStored, removeStored } from "@/lib/storage";

beforeEach(() => {
  vi.useFakeTimers();
  removeStored(WATER_KEY);
  removeStored(POURED_KEY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("regador", () => {
  it("ganhar gotas enche o regador sem fazer o jardim crescer", () => {
    grantWater("checkin");
    grantWater("diary");
    expect(readStored<unknown[]>(WATER_KEY, []).length).toBe(2);
    expect(readPoured()).toBe(0);
  });

  it("despejar passa as gotas do regador para o jardim, uma por vez", () => {
    grantWater("checkin");
    grantWater("diary");
    grantWater("habit", "h1");

    expect(pourWater()).toBe(3);
    expect(pourWater()).toBe(0); // já está despejando
    expect(readPoured()).toBe(0);

    vi.advanceTimersByTime(700);
    expect(readPoured()).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(readPoured()).toBe(3);
    expect(pourWater()).toBe(0); // regador vazio
  });

  it("jardim de antes do regador mantém o que já tinha", () => {
    localStorage.setItem(WATER_KEY, JSON.stringify([{ id: "a", source: "habit", date: "2026-09-01" }]));
    expect(readPoured()).toBe(1);
    grantWater("checkin");
    expect(readPoured()).toBe(1);
    expect(pourWater()).toBe(1);
  });
});
