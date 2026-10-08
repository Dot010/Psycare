import type { ActivityRecord } from "@/features/activities/types";
import type { SymptomStat } from "@/features/health/logic";

/** O que o paciente escolheu mostrar ao profissional. Tudo é opcional e pode ser desligado a qualquer momento. */
export interface Sharing {
  mood: boolean;
  /** Só os registros que o paciente marcou "levar para a consulta". */
  diary: boolean;
  activities: boolean;
  /** Remédios, doses marcadas e sintomas. */
  health: boolean;
}

export interface MedLine {
  nome: string;
  dosagem: string;
  horarios: string;
  /** Doses marcadas / previstas nos últimos 7 dias. */
  taken: number;
  planned: number;
}

/** O que o profissional enxerga de um paciente. Campo ausente = o paciente não compartilhou. */
export interface PatientSnapshot {
  moodDays?: { date: string; level: number }[];
  topics?: { date: string; title: string }[];
  activities?: ActivityRecord[];
  symptoms?: SymptomStat[];
  meds?: MedLine[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  /** Desde quando acompanha (AAAA-MM-DD). */
  since: string;
  /** Verdadeiro para quem usa o app neste navegador: os dados vêm do que foi registrado aqui. */
  live?: boolean;
  /** Valor da sessão em reais, para o financeiro de exemplo. */
  fee: number;
}

export interface SessionNote {
  id: string;
  patientId: string;
  date: string;
  /** Texto privado do profissional. Nunca aparece para o paciente. */
  text: string;
}

export interface ProAssignment {
  id: string;
  patientId: string;
  kind: ActivityRecord["kind"];
  assignedAt: string;
  dueDate?: string;
  message?: string;
}

export interface ProSession {
  id: string;
  patientId: string;
  /** AAAA-MM-DD */
  data: string;
  hora: string;
  tipo: "online" | "presencial";
  status: "confirmado" | "pendente" | "cancelado" | "realizada";
}
