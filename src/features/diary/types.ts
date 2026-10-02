export interface DiaryEntry {
  id: string;
  /** Dia do registro no formato AAAA-MM-DD (data local). */
  date: string;
  /** Quando foi editado pela última vez (AAAA-MM-DD), se foi. */
  editedAt?: string;
  mood: string;
  title: string;
  content: string;
  /** Nível de ansiedade/carga de 1 a 5, informado ao criar o registro. */
  anxietyLevel?: number;
  /** Marcado para levar à próxima consulta. */
  discussInSession?: boolean;
}
