import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Block } from "@/components/ui/block";
import { UnderlineTabs } from "@/components/ui/underline-tabs";

beforeEach(() => {
  // O jsdom não tem matchMedia; as animações perguntam se a pessoa pediu menos movimento.
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
});

describe("Page", () => {
  it("mostra a linha de cima, o título como h1 e as ações", () => {
    render(
      <Page title="Saúde" kicker="sábado, 14 de novembro" actions={<button type="button">Novo</button>}>
        conteúdo
      </Page>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Saúde" })).toHaveClass("font-light");
    expect(screen.getByText("sábado, 14 de novembro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo" })).toBeInTheDocument();
  });

  it("dentro de abas, o título vira h2", () => {
    render(
      <Page title="Remédios" embedded>
        conteúdo
      </Page>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Remédios" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});

describe("Block", () => {
  it("com título, vira uma seção com nome", () => {
    render(<Block title="Exames">lista</Block>);

    expect(screen.getByRole("region", { name: "Exames" })).toHaveTextContent("lista");
  });

  it("a cor de destaque muda o fundo", () => {
    render(
      <Block title="Próxima sessão" tone="sun">
        5 dias
      </Block>,
    );

    expect(screen.getByRole("region", { name: "Próxima sessão" })).toHaveClass("bg-sun-300");
  });
});

describe("PageColumns", () => {
  it("põe a principal e a lateral, na ordem de leitura", () => {
    render(
      <PageColumns aside={<Block title="Lateral">b</Block>}>
        <Block title="Principal">a</Block>
      </PageColumns>,
    );

    const [principal, lateral] = screen.getAllByRole("region");
    expect(principal).toHaveAccessibleName("Principal");
    expect(lateral).toHaveAccessibleName("Lateral");
  });
});

function TabsDeTeste() {
  const [tab, setTab] = useState<"hoje" | "remedios" | "exames">("hoje");
  return (
    <UnderlineTabs
      label="Seções de Saúde"
      value={tab}
      onChange={setTab}
      tabs={[
        { id: "hoje", label: "Hoje" },
        { id: "remedios", label: "Remédios" },
        { id: "exames", label: "Exames" },
      ]}
    />
  );
}

describe("UnderlineTabs", () => {
  it("só a aba ativa fica no Tab e o clique troca", async () => {
    render(<TabsDeTeste />);

    expect(screen.getByRole("tab", { name: "Hoje" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Remédios" })).toHaveAttribute("tabindex", "-1");

    await userEvent.click(screen.getByRole("tab", { name: "Exames" }));

    expect(screen.getByRole("tab", { name: "Exames" })).toHaveAttribute("aria-selected", "true");
  });

  it("as setas, Home e End andam entre as abas", async () => {
    render(<TabsDeTeste />);
    screen.getByRole("tab", { name: "Hoje" }).focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Remédios" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Remédios" })).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Exames" })).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Hoje" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("ProgressRing", () => {
  it("tem um nome para leitor de tela e se fecha até o valor", async () => {
    render(
      <ProgressRing value={0.5} label="4 de 8 dias">
        4/8
      </ProgressRing>,
    );

    expect(screen.getByRole("img", { name: "4 de 8 dias" })).toBeInTheDocument();
    const bar = screen.getByTestId("progress-ring-bar");
    const full = Number(bar.getAttribute("stroke-dasharray"));

    await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));

    expect(Number(bar.getAttribute("stroke-dashoffset"))).toBeCloseTo(full / 2);
  });

  it("valores fora de 0 a 1 são cortados", async () => {
    render(<ProgressRing value={3} label="tudo" />);
    await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));

    expect(Number(screen.getByTestId("progress-ring-bar").getAttribute("stroke-dashoffset"))).toBe(0);
  });
});
