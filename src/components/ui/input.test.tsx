import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("limita campos de texto por padrão", () => {
    render(<Input aria-label="nome" />);
    expect(screen.getByLabelText("nome")).toHaveAttribute("maxlength", "200");
  });

  it("deixa quem usa trocar o limite", () => {
    render(<Input aria-label="nome" maxLength={30} />);
    expect(screen.getByLabelText("nome")).toHaveAttribute("maxlength", "30");
  });

  it("não aplica limite em data, hora e número", () => {
    render(<Input aria-label="dia" type="date" />);
    expect(screen.getByLabelText("dia")).not.toHaveAttribute("maxlength");
  });
});
