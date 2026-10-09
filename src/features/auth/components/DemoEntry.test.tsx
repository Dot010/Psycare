import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoEntry } from "./DemoEntry";

const push = vi.fn();
const demoLoginAction = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/features/auth/actions", () => ({
  demoLoginAction: (profile: string) => demoLoginAction(profile),
}));

describe("DemoEntry", () => {
  beforeEach(() => {
    push.mockReset();
    demoLoginAction.mockReset();
    demoLoginAction.mockResolvedValue({ success: true, redirectTo: "/dashboard/home" });
    window.localStorage.clear();
  });

  it("começa só com paciente e profissional", () => {
    render(<DemoEntry />);
    expect(screen.getByRole("button", { name: /Entrar como paciente/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar como profissional/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Psiquiatra/ })).not.toBeInTheDocument();
  });

  it("paciente entra direto", async () => {
    render(<DemoEntry />);
    await userEvent.click(screen.getByRole("button", { name: /Entrar como paciente/ }));
    expect(demoLoginAction).toHaveBeenCalledWith("patient");
    expect(push).toHaveBeenCalledWith("/dashboard/home");
  });

  it("profissional escolhe entre psicólogo e psiquiatra", async () => {
    render(<DemoEntry />);
    await userEvent.click(screen.getByRole("button", { name: /Entrar como profissional/ }));
    expect(demoLoginAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /Psiquiatra/ }));
    expect(demoLoginAction).toHaveBeenCalledWith("psychiatrist");
  });

  it("dá para voltar à primeira escolha", async () => {
    render(<DemoEntry />);
    await userEvent.click(screen.getByRole("button", { name: /Entrar como profissional/ }));
    await userEvent.click(screen.getByRole("button", { name: /Voltar/ }));
    expect(screen.getByRole("button", { name: /Entrar como paciente/ })).toBeInTheDocument();
  });
});
