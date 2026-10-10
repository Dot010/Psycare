import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import ActivitiesView from "./ActivitiesView";

beforeEach(() => localStorage.clear());

describe("Atividades", () => {
  it("tem o Respirar entre as atividades, levando ao exercício guiado", () => {
    render(
      <UndoProvider>
        <ActivitiesView />
      </UndoProvider>,
    );
    const link = screen.getByRole("link", { name: /Respirar um minuto/ });
    expect(link).toHaveAttribute("href", "/dashboard/breathing");
  });
});
