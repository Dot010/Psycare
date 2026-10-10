import { addDays } from "@/features/health/logic";
import { daysUntil } from "./prescriptions";
import type { Prescription, PrescriptionChange, PrescriptionKind } from "./types";

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

/** Onde a receita está: emitida, usada, vencida ou suspensa. */
export type Lifecycle = "issued" | "used" | "expired" | "stopped";

export function lifecycle(p: Pick<Prescription, "status" | "useUntil">, today: string): Lifecycle {
  if (p.status === "stopped") return "stopped";
  if (p.status === "used") return "used";
  return daysUntil(p.useUntil, today) < 0 ? "expired" : "issued";
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
    if (!current || p.consultationDate >= current.consultationDate) latest.set(key, p);
  }
  return [...latest.values()];
}

/** Um remédio precisa de atenção quando a última receita já foi usada, venceu ou vence em até 5 dias. */
export function needsAttention(latest: Prescription, today: string): boolean {
  const state = lifecycle(latest, today);
  if (state === "stopped") return false;
  if (state === "used" || state === "expired") return true;
  return daysUntil(latest.useUntil, today) <= 5;
}

/** Rascunho da próxima receita: tudo igual à última, consulta hoje. O período o psiquiatra ajusta. */
export interface PrescriptionDraft {
  patientId: string;
  nome: string;
  dosagem: string;
  kind: PrescriptionKind;
  consultationDate: string;
  useFrom: string;
  useUntil: string;
}

const DEFAULT_USE_DAYS = 30;

export function draftFrom(last: Prescription, today: string): PrescriptionDraft {
  return {
    patientId: last.patientId,
    nome: last.nome,
    dosagem: last.dosagem,
    kind: last.kind,
    consultationDate: today,
    useFrom: today,
    useUntil: addDays(today, DEFAULT_USE_DAYS),
  };
}
