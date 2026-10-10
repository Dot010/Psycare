export type Importance = "high" | "medium" | "low";

/** De onde a tarefa veio. As que não são "free" vêm de um profissional e só mudam de dia, hora e importância. */
export type TaskSource = "free" | "consulta" | "receita" | "encaminhamento";

export interface Task {
  id: string;
  title: string;
  /** AAAA-MM-DD. Sem data a tarefa fica em "Sem dia". */
  date?: string;
  /** HH:MM, opcional. */
  time?: string;
  importance: Importance;
  done: boolean;
  source: TaskSource;
}
