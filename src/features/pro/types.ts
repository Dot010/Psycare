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

/**
 * Tipo da receita, escolhido pelo psiquiatra (cor do papel):
 * A = Notificação de Receita A (amarela), B = Notificação B (azul),
 * C1 = Receita de Controle Especial em 2 vias (branca), common = receita comum (branca).
 */
export type PrescriptionKind = "A" | "B" | "C1" | "common";

/** O que mudou em relação à receita anterior do mesmo remédio. */
export type PrescriptionChange = "none" | "dose" | "switch" | "stop";

/** Uma consulta já feita (ou de hoje) entre o médico e um paciente. */
export interface Consultation {
  id: string;
  patientId: string;
  /** AAAA-MM-DD */
  date: string;
  hora: string;
  status: "realizada" | "confirmado";
}

/** De onde a receita saiu: de uma consulta ou de um pedido que o médico avaliou. */
export type PrescriptionOrigin =
  { type: "consultation"; consultationId: string } | { type: "request"; requestId: string };

/**
 * Registro de uma receita. O app NÃO emite nem envia receita: o psiquiatra a entrega em mãos
 * (na consulta ou deixando pronta no consultório) e aqui só registra o que preparou.
 */
export interface Prescription {
  id: string;
  patientId: string;
  nome: string;
  dosagem: string;
  kind: PrescriptionKind;
  origin: PrescriptionOrigin;
  /** Dia em que o psiquiatra registrou (AAAA-MM-DD). */
  preparedAt: string;
  /** Período de uso, definido por ele (AAAA-MM-DD). */
  useFrom: string;
  useUntil: string;
  /** "ready" = pronta para o paciente; "stopped" = o médico suspendeu o remédio. */
  status: "ready" | "stopped";
  change: PrescriptionChange;
  /** Nota curta, só quando houve mudança. */
  changeNote?: string;
}

/** Resposta do psiquiatra a um pedido. */
export interface RequestAnswer {
  kind: "ready" | "consult" | "no";
  /** Motivo curto, só em "no". */
  reason?: string;
  at: string;
  prescriptionId?: string;
}

/** Pedido de nova receita feito pelo paciente. */
export interface PrescriptionRequest {
  id: string;
  patientId: string;
  nome: string;
  requestedAt: string;
  note?: string;
  answer?: RequestAnswer;
}

/** Aviso curto que o paciente recebe quando algo muda. */
export interface PatientNotice {
  id: string;
  patientId: string;
  text: string;
  at: string;
}

/** Passo que só o paciente vê: ele retirou a receita? comprou o remédio? O médico não sabe. */
export type PatientStep = "retirei" | "comprei";

/** 1 = pedido, 2 = coletado, 3 = resultado chegou. */
export type ExamStep = 1 | 2 | 3;

export interface ExamRequest {
  id: string;
  patientId: string;
  nome: string;
  requestedAt: string;
  step: ExamStep;
  result?: string;
}
