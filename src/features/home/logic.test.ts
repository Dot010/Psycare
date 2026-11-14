import { describe, expect, it } from "vitest";
import type { DiaryEntry } from "@/features/diary/types";
import { entriesForSession, timeGreeting, weekdayShort } from "./logic";

describe("timeGreeting", () => {
  it("muda com a hora", () => {
    expect(timeGreeting("Ana", 8)).toBe("Bom dia, Ana");
    expect(timeGreeting("Ana", 15)).toBe("Boa tarde, Ana");
    expect(timeGreeting("Ana", 21)).toBe("Boa noite, Ana");
    expect(timeGreeting("Ana", 2)).toBe("Boa noite, Ana");
  });

  it("sem nome, só a saudação", () => {
    expect(timeGreeting("  ", 15)).toBe("Boa tarde!");
  });
});

describe("entriesForSession", () => {
  const entry = (date: string, discussInSession: boolean) =>
    ({ id: date, date, mood: "Bem", title: "", content: "", discussInSession }) as DiaryEntry;

  it("conta só os marcados depois da última sessão", () => {
    const entries = [entry("2026-11-01", true), entry("2026-11-10", true), entry("2026-11-12", false)];

    expect(entriesForSession(entries, "2026-11-05")).toBe(1);
    expect(entriesForSession(entries)).toBe(2);
  });
});

describe("weekdayShort", () => {
  it("dia da semana com maiúscula e dia/mês", () => {
    expect(weekdayShort("2026-11-18")).toBe("Quarta, 18/11");
  });
});
