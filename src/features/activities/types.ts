export type ActivityKind = "wheel" | "thoughts" | "thermometer" | "sleep" | "values" | "plan";

export type AnswerValue = string | number | string[];
export type Answers = Record<string, AnswerValue | undefined>;

export type FieldSpec =
  | { id: string; label: string; hint?: string; type: "text" | "long"; required?: boolean }
  | { id: string; label: string; hint?: string; type: "scale"; min: number; max: number; required?: boolean }
  | { id: string; label: string; hint?: string; type: "hours" }
  | {
      id: string;
      label: string;
      hint?: string;
      type: "multi";
      options: readonly string[];
      maxSelect: number;
    };

export interface ActivityRecord {
  id: string;
  kind: ActivityKind;
  /** Dia em que foi feita (AAAA-MM-DD). */
  date: string;
  answers: Answers;
  /** Anotação livre do dia, para lembrar do contexto depois. */
  note?: string;
  /** Pedida por um profissional: guarda qual pedido esta atividade respondeu. */
  assignmentId?: string;
}

export interface Assignment {
  id: string;
  kind: ActivityKind;
  /** Nome de quem pediu. */
  by: string;
  assignedAt: string;
  dueDate?: string;
  /** Orientação curta do profissional. */
  message?: string;
  /** Preenchido quando o paciente faz a atividade. */
  doneRecordId?: string;
}
