import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { WATER_KEY } from "@/features/garden/water";
import { toISODate } from "@/lib/dates";
import { PLANNER_KEY } from "../hooks/usePlanner";
import { NowCard } from "./NowCard";
import PlannerView from "./PlannerView";
import { TaskReminder } from "./TaskReminder";

const today = () => toISODate(new Date());
const wrap = (ui: React.ReactNode) => render(<UndoProvider>{ui}</UndoProvider>);

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("Agora e Feito", () => {
  it("Feito conclui a tarefa e rega o jardim", async () => {
    localStorage.setItem(
      PLANNER_KEY,
      JSON.stringify([
        { id: "x1", title: "Alongar", date: today(), importance: "medium", done: false, source: "free" },
      ]),
    );
    wrap(<NowCard />);
    expect(screen.getByText("Alongar")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Feito" }));
    const water = JSON.parse(localStorage.getItem(WATER_KEY) ?? "[]");
    expect(water).toHaveLength(1);
    expect(screen.queryByText("Alongar")).not.toBeInTheDocument();
  });
});

describe("hábitos no Meu dia", () => {
  it("aparecem como tarefas de todo dia e marcar vale como marcar o hábito", async () => {
    wrap(<PlannerView />);
    const box = screen.getByRole("checkbox", { name: /Marcar como feita: Treinar 2 horas/ });
    expect(screen.getAllByText(/hábito de todo dia/).length).toBeGreaterThan(0);
    await userEvent.click(box);
    expect(screen.getByRole("checkbox", { name: /Desmarcar: Treinar 2 horas/ })).toBeInTheDocument();
    const habits = JSON.parse(localStorage.getItem("psycare:habits:v1") ?? "[]");
    expect(habits.find((h: { id: string }) => h.id === "1").lastCompleted).toBe(today());
  });
});

describe("aviso na hora da tarefa", () => {
  it("mostra o aviso quando a hora chega", () => {
    vi.useFakeTimers();
    const when = new Date();
    when.setHours(10, 0, 0, 0);
    vi.setSystemTime(when);
    localStorage.setItem(
      PLANNER_KEY,
      JSON.stringify([
        {
          id: "x2",
          title: "Tomar água",
          date: toISODate(when),
          time: "10:00",
          importance: "medium",
          done: false,
          source: "free",
        },
      ]),
    );
    wrap(<TaskReminder />);
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(screen.getByText(/Agora, 10:00: Tomar água/)).toBeInTheDocument();
  });
});
