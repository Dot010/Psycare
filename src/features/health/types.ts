export interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  horario: string;
}

export interface Exame {
  id: string;
  titulo: string;
  data: string;
  resultado: string;
}

export interface Sintoma {
  id: string;
  descricao: string;
  data: string;
  nota: string;
}
