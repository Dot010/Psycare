import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import { clock, FocusNow } from "./FocusNow";

const task: Task = {
  id: "t1",
  title: "Responder o e-mail",
  importance: "medium",
  done: false,
  source: "free",
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Agora com modo foco", () => {
  it("formata o relógio", () => {
    expect(clock(900)).toBe("15:00");
    expect(clock(61)).toBe("01:01");
    expect(clock(0)).toBe("00:00");
  });

  it("o modo foco conta o tempo, pausa e continua", () => {
    render(<FocusNow task={task} onDone={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Modo foco · 15 min" }));
    expect(screen.getByRole("img", { name: "Faltam 15:00 de foco" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole("img", { name: "Faltam 14:57 de foco" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("img", { name: "Faltam 14:57 de foco" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("img", { name: "Faltam 14:56 de foco" })).toBeInTheDocument();
  });

  it("quando o tempo acaba, avisa sem culpa e para de contar", () => {
    render(<FocusNow task={task} onDone={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Modo foco · 15 min" }));

    act(() => vi.advanceTimersByTime(15 * 60 * 1000));

    expect(screen.getByText(/O tempo de foco acabou/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();
  });

  it("Concluí e Já fiz marcam a tarefa; Sair do foco volta ao começo", () => {
    const onDone = vi.fn();
    render(<FocusNow task={task} onDone={onDone} />);

    fireEvent.click(screen.getByRole("button", { name: "Já fiz" }));
    fireEvent.click(screen.getByRole("button", { name: "25 min" }));
    fireEvent.click(screen.getByRole("button", { name: "Concluí" }));
    expect(onDone).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Sair do foco" }));
    expect(screen.getByRole("button", { name: "Modo foco · 15 min" })).toBeInTheDocument();
  });

  it("tarefa que se conclui em outro lugar mostra só o Abrir", () => {
    render(<FocusNow task={{ ...task, readonly: true, href: "/dashboard/health" }} onDone={() => {}} />);

    expect(screen.getByRole("link", { name: "Abrir" })).toHaveAttribute("href", "/dashboard/health");
    expect(screen.queryByRole("button", { name: /Modo foco/ })).not.toBeInTheDocument();
  });
});
