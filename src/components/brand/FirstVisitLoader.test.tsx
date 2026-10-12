import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FirstVisitLoader } from "./FirstVisitLoader";
import { isPresentationPath } from "./first-visit";

let pathname = "/login";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function mockReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("isPresentationPath", () => {
  it("é só a entrada do app", () => {
    expect(isPresentationPath("/login")).toBe(true);
    expect(isPresentationPath("/register")).toBe(true);
    expect(isPresentationPath("/")).toBe(true);
    expect(isPresentationPath("/dashboard")).toBe(false);
    expect(isPresentationPath(null)).toBe(false);
  });
});

describe("FirstVisitLoader", () => {
  beforeEach(() => {
    pathname = "/login";
    mockReducedMotion(false);
  });
  afterEach(() => vi.useRealTimers());

  it("já vem na tela do login, com a marca e o nome", () => {
    render(<FirstVisitLoader />);
    expect(screen.getByRole("status", { name: "Abrindo o PsyCare" })).toBeInTheDocument();
    expect(screen.getByText("Psy Care")).toBeInTheDocument();
  });

  it("não aparece dentro do app", () => {
    pathname = "/dashboard";
    render(<FirstVisitLoader />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("com a animação do GSAP, termina e libera a página", async () => {
    render(<FirstVisitLoader />);
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull(), { timeout: 6000 });
  }, 8000);

  it("com 'reduzir movimento', fica parada 0,9 s e sai", () => {
    mockReducedMotion(true);
    vi.useFakeTimers();
    render(<FirstVisitLoader />);
    act(() => void vi.advanceTimersByTime(800));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
