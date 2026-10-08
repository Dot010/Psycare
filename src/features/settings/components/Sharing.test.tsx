import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { SHARING_KEY } from "@/features/pro/snapshot";
import { SharingPanel } from "./SharingPanel";

describe("SharingPanel", () => {
  beforeEach(() => window.localStorage.clear());

  it("começa sem compartilhar o diário e guarda a escolha", async () => {
    render(<SharingPanel />);
    const diary = screen.getByRole("checkbox", { name: /Assuntos que marquei/ });
    expect(diary).not.toBeChecked();
    await userEvent.click(diary);
    expect(diary).toBeChecked();
    expect(JSON.parse(window.localStorage.getItem(SHARING_KEY) as string)).toMatchObject({
      diary: true,
      mood: true,
    });
  });

  it("desligar tira o acesso na hora", async () => {
    render(<SharingPanel />);
    await userEvent.click(screen.getByRole("checkbox", { name: /Meu humor/ }));
    expect(JSON.parse(window.localStorage.getItem(SHARING_KEY) as string).mood).toBe(false);
  });
});
