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

/**
 * Receita de exemplo: documento de uso único, de um paciente, emitido numa consulta.
 * Nada é emitido de verdade; a demonstração só mostra como seria acompanhar.
 */
export interface Prescription {
  id: string;
  patientId: string;
  nome: string;
  dosagem: string;
  kind: PrescriptionKind;
  /** Dia da consulta em que ela foi emitida (AAAA-MM-DD). */
  consultationDate: string;
  /** Período de uso definido pelo psiquiatra (AAAA-MM-DD). */
  useFrom: string;
  useUntil: string;
  /** Emitida e ainda não usada; usada (o paciente já comprou); ou suspensa pelo médico. */
  status: "issued" | "used" | "stopped";
  change: PrescriptionChange;
  /** Nota curta, só quando houve mudança. */
  changeNote?: string;
}

/** Pedido de nova receita feito pelo paciente. */
export interface PrescriptionRequest {
  id: string;
  patientId: string;
  nome: string;
  requestedAt: string;
  note?: string;
}

/** Aviso curto que o paciente recebe quando algo muda na receita dele. */
export interface PatientNotice {
  id: string;
  patientId: string;
  prescriptionId: string;
  text: string;
  at: string;
}

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
