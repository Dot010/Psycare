import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FirstVisitLoader } from "./FirstVisitLoader";
import { claimFirstVisit, FIRST_VISIT_KEY } from "./first-visit";

function setReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, "readyState", { value, configurable: true });
}

describe("FirstVisitLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    setReadyState("loading");
  });
  afterEach(() => {
    vi.useRealTimers();
    setReadyState("complete");
  });

  it("não aparece se a página carrega rápido", () => {
    render(<FirstVisitLoader />);
    act(() => {
      vi.advanceTimersByTime(100);
      window.dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("aparece após 200 ms, fica ao menos 400 ms e sai quando a página termina", () => {
    render(<FirstVisitLoader />);
    act(() => void vi.advanceTimersByTime(250));
    expect(screen.getByRole("status", { name: "Abrindo o PsyCare" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(50);
      window.dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("status")).toBeInTheDocument(); // ainda não passou 400 ms visível

    act(() => void vi.advanceTimersByTime(100));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("sai sozinho em 1 s mesmo se a página demorar", () => {
    render(<FirstVisitLoader />);
    act(() => void vi.advanceTimersByTime(250));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("só uma vez por sessão", () => {
    window.sessionStorage.setItem(FIRST_VISIT_KEY, "1");
    render(<FirstVisitLoader />);
    act(() => void vi.advanceTimersByTime(500));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("claimFirstVisit marca a sessão e não repete", () => {
    expect(claimFirstVisit()).toBe(true);
    expect(claimFirstVisit()).toBe(false);
  });
});
