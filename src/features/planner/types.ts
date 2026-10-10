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
  /** Para onde a tarefa leva (por exemplo, o remédio em Saúde). */
  href?: string;
  /** A tarefa só se conclui em outro lugar, não pela caixinha do Meu dia. */
  readonly?: boolean;
}

/** O que a pessoa pode mudar numa tarefa que veio de um profissional. */
export interface TaskOverride {
  date?: string;
  time?: string;
  importance?: Importance;
  done?: boolean;
}
