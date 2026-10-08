import { describe, expect, it } from "vitest";
import { finish, GOALS, isGoal } from "./logic";

describe("onboarding", () => {
  it("só aceita objetivos da lista", () => {
    expect(isGoal(GOALS[0])).toBe(true);
    expect(isGoal("qualquer coisa")).toBe(false);
  });
  it("conclui com ou sem objetivo", () => {
    expect(finish(GOALS[1])).toEqual({ done: true, goal: GOALS[1] });
    expect(finish()).toEqual({ done: true });
    expect(finish("inventado")).toEqual({ done: true });
  });
});
