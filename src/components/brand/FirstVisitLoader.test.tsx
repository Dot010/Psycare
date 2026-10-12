import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FirstVisitLoader } from "./FirstVisitLoader";
import { SEEN_COOKIE } from "./first-visit";

function setReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, "readyState", { value, configurable: true });
}

describe("FirstVisitLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.cookie = `${SEEN_COOKIE}=; max-age=0; path=/`;
    setReadyState("loading");
  });
  afterEach(() => {
    vi.useRealTimers();
    setReadyState("complete");
  });

  it("já vem na tela e marca a sessão como vista", () => {
    render(<FirstVisitLoader show />);
    expect(screen.getByRole("status", { name: "Abrindo o PsyCare" })).toBeInTheDocument();
    expect(document.cookie).toContain(`${SEEN_COOKIE}=1`);
  });

  it("fica ao menos 0,9 s mesmo se a página carrega antes", () => {
    render(<FirstVisitLoader show />);
    act(() => {
      vi.advanceTimersByTime(100);
      window.dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1000)); // 0,9 s + esmaecer
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("sai sozinho em 1,6 s mesmo se a página demorar", () => {
    render(<FirstVisitLoader show />);
    act(() => void vi.advanceTimersByTime(1600 + 400));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("não aparece quando a sessão já viu a abertura", () => {
    render(<FirstVisitLoader show={false} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(document.cookie).not.toContain(SEEN_COOKIE);
  });
});
