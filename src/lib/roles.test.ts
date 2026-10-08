import { describe, expect, it } from "vitest";
import { canAccess, homeFor } from "@/lib/roles";

const patient = { role: "patient" as const };
const pro = { role: "professional" as const };

describe("roles", () => {
  it("manda cada conta para a sua página inicial", () => {
    expect(homeFor(patient)).toBe("/dashboard/home");
    expect(homeFor(pro)).toBe("/dashboard/pro");
  });

  it("separa a área do paciente da área do profissional", () => {
    expect(canAccess(patient, "/dashboard/diary")).toBe(true);
    expect(canAccess(patient, "/dashboard/pro")).toBe(false);
    expect(canAccess(patient, "/dashboard/pro/patients")).toBe(false);
    expect(canAccess(pro, "/dashboard/pro")).toBe(true);
    expect(canAccess(pro, "/dashboard/pro/patients/p1")).toBe(true);
    expect(canAccess(pro, "/dashboard/diary")).toBe(false);
  });

  it("não confunde prefixos parecidos", () => {
    expect(canAccess(patient, "/dashboard/professional-help")).toBe(true);
    expect(canAccess(pro, "/dashboard/professional-help")).toBe(false);
  });

  it("não interfere fora do /dashboard", () => {
    expect(canAccess(pro, "/login")).toBe(true);
  });
});
