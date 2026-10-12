import { describe, expect, it } from "vitest";
import { isClockTime, isRealDate, tooLong } from "./validation";

describe("validation", () => {
  it("isRealDate aceita dias reais e recusa os que não existem", () => {
    expect(isRealDate("2026-10-12")).toBe(true);
    expect(isRealDate("2028-02-29")).toBe(true);
    expect(isRealDate("2026-02-29")).toBe(false);
    expect(isRealDate("2026-02-31")).toBe(false);
    expect(isRealDate("2026-13-01")).toBe(false);
    expect(isRealDate("12/10/2026")).toBe(false);
    expect(isRealDate("")).toBe(false);
  });

  it("isClockTime confere HH:MM", () => {
    expect(isClockTime("00:00")).toBe(true);
    expect(isClockTime("23:59")).toBe(true);
    expect(isClockTime("24:00")).toBe(false);
    expect(isClockTime("8:00")).toBe(false);
    expect(isClockTime("")).toBe(false);
  });

  it("tooLong monta o aviso", () => {
    expect(tooLong(80)).toBe("Use até 80 caracteres");
  });
});
