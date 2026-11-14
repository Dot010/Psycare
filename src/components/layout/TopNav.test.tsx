import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TopNav from "./TopNav";

let pathname = "/dashboard/home";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("@/features/auth/actions", () => ({ logoutAction: vi.fn() }));
vi.mock("@/components/feedback/ThemeToggle", () => ({ ThemeToggle: () => null }));

describe("barra do topo", () => {
  it("mostra os itens principais e marca a página atual", () => {
    pathname = "/dashboard/diary";
    render(<TopNav variant="patient" />);

    for (const title of ["Início", "Meu dia", "Diário", "Atividades", "Saúde"]) {
      expect(screen.getByRole("link", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Diário" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("o resto fica no Mais", async () => {
    pathname = "/dashboard/home";
    render(<TopNav variant="patient" />);

    expect(screen.queryByRole("menuitem", { name: /Consultas/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Mais/ }));

    expect(screen.getByRole("menuitem", { name: /Consultas/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Plano de segurança/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Configurações/ })).toBeInTheDocument();
  });

  it("Sair fica no menu da conta, e o paciente tem o botão de ajuda à vista", async () => {
    render(<TopNav variant="patient" />);

    expect(screen.getByRole("button", { name: "Preciso de ajuda agora" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sua conta" }));

    expect(screen.getByRole("menuitem", { name: "Sair" })).toBeInTheDocument();
  });

  it("o profissional não tem o botão de ajuda do paciente", () => {
    pathname = "/dashboard/pro";
    render(<TopNav variant="psychologist" />);

    expect(screen.queryByRole("button", { name: "Preciso de ajuda agora" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Painel do dia" })).toHaveAttribute("aria-current", "page");
  });
});
