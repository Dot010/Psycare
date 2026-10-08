export interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  /** Texto livre dos registros antigos. Hoje o que vale são os `horarios`. */
  frequencia: string;
  /** Horário único dos registros antigos ("08:00" ou texto livre). */
  horario: string;
  /** Horários das doses (HH:MM). Quando ausente, usa-se `horario` se ele for um horário válido. */
  horarios?: string[];
  /** Ex.: "com comida", "antes de dormir". */
  observacao?: string;
}

export interface ExameAnexo {
  nome: string;
  tipo: string;
  /** Conteúdo do arquivo em data URL. Fica só neste navegador. */
  dados: string;
}

export interface Exame {
  id: string;
  titulo: string;
  /** AAAA-MM-DD. */
  data: string;
  /** O que o exame mostrou, com as palavras da pessoa ou do laudo. */
  resultado?: string;
  anexo?: ExameAnexo;
}

export interface Sintoma {
  id: string;
  descricao: string;
  /** AAAA-MM-DD. Registros antigos podem estar em DD/MM/AAAA: veja `normalizeSintoma`. */
  data: string;
  /** Observação livre (nos registros antigos, a intensidade em palavras). */
  nota: string;
  /** 1 (muito leve) a 5 (muito forte). */
  intensidade?: number;
}
