import { describe, expect, it } from "vitest";
import { parseTheme } from "@/lib/theme-cookie";

describe("parseTheme", () => {
  it("só ativa o escuro quando o cookie pede", () => {
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme(undefined)).toBe("light");
    expect(parseTheme("qualquer")).toBe("light");
  });
});
