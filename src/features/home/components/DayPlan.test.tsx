import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGarden } from "@/features/garden/hooks/useGarden";
import { WATER_KEY } from "@/features/garden/water";
import { missionsForDay } from "@/features/missions/logic";
import { toISODate } from "@/lib/dates";
import { DayPlan } from "./DayPlan";

/** O DayPlan ligado ao jardim de verdade, como no Início. */
function Harness() {
  const garden = useGarden();
  return (
    <DayPlan
      todayCheckIn={garden.todayCheckIn}
      doneToday={garden.doneToday}
      drops={garden.poured + garden.available}
      onCheckIn={garden.checkIn}
      onTagsChange={garden.setTags}
    />
  );
}

/** Um dia em que as missões têm pelo menos uma manual (sem ação do app por trás). */
function dayWithManualMission(): Date {
  const day = new Date(2026, 10, 1, 12);
  for (let i = 0; i < 60; i++) {
    if (missionsForDay(toISODate(day)).some((m) => !m.auto)) return day;
    day.setDate(day.getDate() + 1);
  }
  throw new Error("Nenhum dia com missão manual");
}

const water = () => JSON.parse(localStorage.getItem(WATER_KEY) ?? "[]") as unknown[];

beforeEach(() => {
  localStorage.clear();
  // O jsdom não tem matchMedia; as animações (CountUp) perguntam se a pessoa pediu menos movimento.
  window.matchMedia ??= ((query: string) => ({
    matches: true,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as typeof window.matchMedia;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(dayWithManualMission());
});
afterEach(() => vi.useRealTimers());

describe("Seu dia", () => {
  it("começa com o check-in aberto e nada feito", () => {
    render(<Harness />);

    expect(screen.getByText(/^0 de \d/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Como você está\?\s*\(pendente\)/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("escolher o rosto não registra; o Registrar grava, rega o jardim e abre o próximo", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("radio", { name: /Bem/ }));
    expect(water()).toHaveLength(0);

    await userEvent.click(screen.getByRole("button", { name: "Sono" }));
    await userEvent.click(screen.getByRole("button", { name: "Registrar humor" }));

    const checkin = screen.getByRole("button", { name: /Como você está\?\s*\(feito\)/ });
    expect(checkin).toHaveAttribute("aria-expanded", "false");
    expect(water().length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { expanded: true })).toHaveLength(1);
    const saved = JSON.parse(localStorage.getItem("psycare:checkins:v1") ?? "[]");
    expect(saved[0]).toMatchObject({ level: 4, tags: ["Sono"] });
  });

  it("sem escolher um rosto, o Registrar fica desligado", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Registrar humor" })).toBeDisabled();
  });

  it("missão manual: marcar como feito conta no progresso", async () => {
    const manual = missionsForDay(toISODate(new Date())).find((m) => !m.auto)!;
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(manual.text) }));
    await userEvent.click(screen.getByRole("button", { name: "Marcar como feito" }));

    expect(
      screen.getByRole("button", { name: new RegExp(`${manual.text}\\s*\\(feito\\)`) }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^1 de \d/)).toBeInTheDocument();
  });

  it("dá para fechar o passo aberto", async () => {
    render(<Harness />);
    const checkin = screen.getByRole("button", { name: /Como você está\?/ });

    await userEvent.click(checkin);

    expect(checkin).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("radio", { name: /Bem/ })).not.toBeInTheDocument();
  });

  it("registrar 'muito mal' oferece respiração, o plano de segurança e o 188", async () => {
    render(<Harness />);
    expect(screen.queryByRole("region", { name: "Para um momento difícil" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /Muito mal/ }));
    await userEvent.click(screen.getByRole("button", { name: "Registrar humor" }));
    const help = screen.getByRole("region", { name: "Para um momento difícil" });
    expect(within(help).getByRole("link", { name: /Respirar um minuto/ })).toHaveAttribute(
      "href",
      "/dashboard/breathing",
    );
    expect(within(help).getByRole("link", { name: /plano de segurança/ })).toHaveAttribute(
      "href",
      "/dashboard/safety",
    );
    expect(within(help).getByRole("link", { name: /Ligar 188/ })).toHaveAttribute("href", "tel:188");
  });
});
