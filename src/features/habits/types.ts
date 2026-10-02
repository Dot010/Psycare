export interface Habit {
  id: string;
  title: string;
  category: string;
  /** Dias seguidos já concluídos. */
  streak: number;
  /** Último dia em que foi concluído (AAAA-MM-DD). */
  lastCompleted?: string;
}
