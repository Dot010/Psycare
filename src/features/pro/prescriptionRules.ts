import { addDays } from "@/features/health/logic";
import { daysUntil } from "./prescriptions";
import type {
  Consultation,
  PatientStep,
  Prescription,
  PrescriptionChange,
  PrescriptionKind,
  PrescriptionRequest,
} from "./types";

/** Nome, cor do papel e cor do selo de cada tipo de receita. */
export const KIND_INFO: Record<PrescriptionKind, { label: string; paper: string; chip: string }> = {
  A: { label: "Notificação A", paper: "amarela", chip: "bg-sun-200 text-ink" },
  B: { label: "Notificação B", paper: "azul", chip: "bg-sky-100 text-sky-900" },
  C1: {
    label: "Controle especial (2 vias)",
    paper: "branca",
    chip: "border border-border bg-card text-foreground",
  },
  common: { label: "Receita comum", paper: "branca", chip: "border border-border bg-card text-foreground" },
};

export const KINDS: PrescriptionKind[] = ["A", "B", "C1", "common"];

/** Onde a receita está para o médico: pronta, vencida ou suspensa. O que o paciente fez depois não conta. */
export type Lifecycle = "ready" | "expired" | "stopped";

export function lifecycle(p: Pick<Prescription, "status" | "useUntil">, today: string): Lifecycle {
  if (p.status === "stopped") return "stopped";
  return daysUntil(p.useUntil, today) < 0 ? "expired" : "ready";
}

/** Compara a receita nova com a anterior do mesmo paciente. */
export function detectChange(
  previous: Pick<Prescription, "nome" | "dosagem"> | undefined,
  next: Pick<Prescription, "nome" | "dosagem">,
): Exclude<PrescriptionChange, "stop"> {
  if (!previous) return "none";
  if (previous.nome.trim().toLowerCase() !== next.nome.trim().toLowerCase()) return "switch";
  if (previous.dosagem.trim() !== next.dosagem.trim()) return "dose";
  return "none";
}

/** A receita mais nova de cada remédio de cada paciente. */
export function latestPerMedicine(list: Prescription[]): Prescription[] {
  const latest = new Map<string, Prescription>();
  for (const p of list) {
    const key = `${p.patientId}|${p.nome.trim().toLowerCase()}`;
    const current = latest.get(key);
    if (!current || p.preparedAt >= current.preparedAt) latest.set(key, p);
  }
  return [...latest.values()];
}

/** Precisa de atenção quando a última receita venceu ou vence em até 5 dias. Suspensa nunca precisa. */
export function needsAttention(latest: Prescription, today: string): boolean {
  const state = lifecycle(latest, today);
  if (state === "stopped") return false;
  if (state === "expired") return true;
  return daysUntil(latest.useUntil, today) <= 5;
}

/**
 * Consultas em que ainda dá para registrar uma receita nova deste remédio: já aconteceram (ou são de hoje),
 * são do mesmo paciente e vêm depois do registro da última receita dele.
 */
export function eligibleConsultations(
  consultations: Consultation[],
  last: Pick<Prescription, "patientId" | "preparedAt">,
  today: string,
): Consultation[] {
  return consultations
    .filter((c) => c.patientId === last.patientId && c.date <= today && c.date > last.preparedAt)
    .sort((a, b) => b.date.localeCompare(a.date) || b.hora.localeCompare(a.hora));
}

/** Rascunho da próxima receita: tudo igual à última. O período o psiquiatra ajusta. */
export interface PrescriptionDraft {
  patientId: string;
  nome: string;
  dosagem: string;
  kind: PrescriptionKind;
  useFrom: string;
  useUntil: string;
}

const DEFAULT_USE_DAYS = 30;

/** `from` é o dia a partir do qual a receita vale (o dia da consulta, ou hoje se veio de um pedido). */
export function draftFrom(last: Prescription, from: string): PrescriptionDraft {
  return {
    patientId: last.patientId,
    nome: last.nome,
    dosagem: last.dosagem,
    kind: last.kind,
    useFrom: from,
    useUntil: addDays(from, DEFAULT_USE_DAYS),
  };
}

/** Em que ponto está um pedido, do ponto de vista do paciente. */
export type RequestStage = "sent" | "ready" | "consult" | "no";

export function requestStage(request: Pick<PrescriptionRequest, "answer">): RequestStage {
  return request.answer?.kind ?? "sent";
}

/** O passo seguinte do paciente depois que a receita está pronta: retirei, depois comprei. */
export function nextStep(current: PatientStep | undefined): PatientStep | undefined {
  if (current === undefined) return "retirei";
  if (current === "retirei") return "comprei";
  return undefined;
}
