import { describe, expect, it } from "vitest";
import type { DiaryEntry } from "@/features/diary/types";
import { entriesForSession, nextStep, timeGreeting, weekdayShort } from "./logic";

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

describe("o próximo passo do Início", () => {
  const base = { now: "10:00", pendingDoses: [], checkedIn: true };

  it("remédio na hora ou atrasado vem primeiro", () => {
    expect(
      nextStep({ ...base, checkedIn: false, pendingDoses: [{ nome: "Lyberdia", time: "08:00" }] }),
    ).toMatchObject({ kind: "dose", title: "Tomar Lyberdia", detail: "Era às 08:00. Ainda dá tempo." });
    // Dose só da noite não entra na frente.
    expect(nextStep({ ...base, pendingDoses: [{ nome: "Topiramato", time: "20:00" }] }).kind).toBe("done");
  });

  it("sessão chegando passa na frente do humor; longe, o humor vem antes", () => {
    const session = { hora: "11:30", profissional: "Dra. Helena Prado" };
    expect(nextStep({ ...base, checkedIn: false, sessionToday: session }).kind).toBe("session");
    expect(nextStep({ ...base, checkedIn: false, sessionToday: { ...session, hora: "17:00" } }).kind).toBe(
      "checkin",
    );
  });

  it("depois vem uma tarefa só; em dia difícil, nem isso", () => {
    const task = { title: "Caminhar 15 minutos", time: "17:30" };
    expect(nextStep({ ...base, task })).toMatchObject({ kind: "task", title: "Caminhar 15 minutos" });
    expect(nextStep({ ...base, task, hardDay: true })).toMatchObject({
      kind: "done",
      title: "Hoje basta o essencial",
    });
  });
});
