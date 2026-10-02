export interface DiaryEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  content: string;
  /** Nível de ansiedade/carga de 1 a 5, informado ao criar o registro. */
  anxietyLevel?: number;
  /** Marcado para levar à próxima consulta. */
  discussInSession?: boolean;
}
