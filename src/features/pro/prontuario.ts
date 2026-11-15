import type { Anamnesis, AnamnesisField, Goal, SessionNote } from "./types";

/**
 * Regras do prontuário, seguindo a Resolução CFP 1/2009: o registro fica guardado (no mínimo 5 anos)
 * e nada se apaga. Corrigir é permitido, mas a versão anterior fica no histórico, com data e hora.
 */

export const NOTE_MAX = 4000;
export const FIELD_MAX = 2000;
export const GOAL_MAX = 200;

export const ANAMNESIS_FIELDS: { id: AnamnesisField; label: string; hint: string }[] = [
  { id: "demanda", label: "Demanda", hint: "O que trouxe a pessoa, com as palavras dela." },
  {
    id: "historia",
    label: "História e contexto",
    hint: "Quando começou, o que já tentou, o momento de vida.",
  },
  { id: "saude", label: "Saúde e medicações", hint: "Diagnósticos, remédios, outros acompanhamentos." },
  { id: "apoio", label: "Rede de apoio", hint: "Com quem conta: família, amigos, trabalho." },
];

export const GOAL_LABEL: Record<Goal["status"], string> = {
  andamento: "Em andamento",
  alcancado: "Alcançado",
  revisto: "Revisto",
};

/** Data e hora locais no formato "AAAA-MM-DD HH:MM". */
export function stamp(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

/** "2026-11-14 22:30" → "14/11/2026 às 22:30". */
export function stampLabel(at: string): string {
  const [date, time] = at.split(" ");
  const [y, m, d] = date.split("-");
  return time ? `${d}/${m}/${y} às ${time}` : `${d}/${m}/${y}`;
}

/**
 * Corrige uma evolução sem perder a anterior: o texto antigo vai para `versions`.
 * Texto vazio ou igual ao atual não muda nada.
 */
export function editNote(note: SessionNote, text: string, at: string): SessionNote {
  const clean = text.trim().slice(0, NOTE_MAX);
  if (!clean || clean === note.text) return note;
  return {
    ...note,
    text: clean,
    editedAt: at,
    versions: [{ text: note.text, until: at }, ...(note.versions ?? [])],
  };
}

/** Atualiza a anamnese guardando como ela estava. Sem mudança real, devolve a mesma. */
export function updateAnamnesis(
  current: Anamnesis | undefined,
  patientId: string,
  fields: Partial<Record<AnamnesisField, string>>,
  at: string,
): Anamnesis {
  const clean: Partial<Record<AnamnesisField, string>> = {};
  for (const { id } of ANAMNESIS_FIELDS) {
    const value = (fields[id] ?? "").trim().slice(0, FIELD_MAX);
    if (value) clean[id] = value;
  }
  const same =
    current && ANAMNESIS_FIELDS.every(({ id }) => (current.fields[id] ?? "") === (clean[id] ?? ""));
  if (same) return current;
  return {
    patientId,
    fields: clean,
    updatedAt: at,
    history: current ? [{ fields: current.fields, until: at }, ...current.history] : [],
  };
}

/** Novo objetivo do plano. `null` quando o texto está vazio. */
export function newGoal(patientId: string, text: string, at: string, id: string): Goal | null {
  const clean = text.trim().slice(0, GOAL_MAX);
  if (!clean) return null;
  return { id, patientId, text: clean, status: "andamento", createdAt: at };
}

/** Objetivo alcançado ou revisto não some do plano: só muda de situação, com a data. */
export function setGoalStatus(goal: Goal, status: Goal["status"], at: string): Goal {
  return goal.status === status ? goal : { ...goal, status, updatedAt: at };
}
