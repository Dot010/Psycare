import { describe, expect, it } from "vitest";
import { TASK_TITLE_MAX, taskTitleSchema } from "./schema";

describe("taskTitleSchema", () => {
  it("limpa espaços repetidos e das pontas", () => {
    const r = taskTitleSchema.safeParse("  Ligar   para a mãe ");
    expect(r.success && r.data).toBe("Ligar para a mãe");
  });

  it("pede um texto quando só há espaços", () => {
    const r = taskTitleSchema.safeParse("   ");
    expect(!r.success && r.error.issues[0].message).toBe("Escreva o que precisa ser feito");
  });

  it("aceita 80 caracteres e recusa 81 com aviso em português", () => {
    expect(taskTitleSchema.safeParse("a".repeat(TASK_TITLE_MAX)).success).toBe(true);
    const r = taskTitleSchema.safeParse("a".repeat(TASK_TITLE_MAX + 1));
    expect(!r.success && r.error.issues[0].message).toBe("Use até 80 caracteres");
  });
});
