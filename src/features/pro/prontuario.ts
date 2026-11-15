import type { Anamnesis, AnamnesisField, Goal, SessionNote } from "./types";

/**
 * Regras do prontuário, seguindo a Resolução CFP 1/2009: o registro fica guardado (no mínimo 5 anos)
 * e nada se apaga. Corrigir é permitido, mas a versão anterior fica no histórico, com data e hora.
 */

export const NOTE_MAX = 4000;
export const FIELD_MAX = 2000;
export const GOAL_MAX = 200;

type Field = { id: AnamnesisField; label: string; hint: string };

/** Anamnese psiquiátrica: o roteiro da primeira consulta médica. */
export const PSYCHIATRY_ANAMNESIS_FIELDS: Field[] = [
  { id: "queixa", label: "Queixa principal", hint: "O que trouxe a pessoa, com as palavras dela." },
  {
    id: "hda",
    label: "História da doença atual",
    hint: "Quando começou, como evoluiu, o que piora e o que alivia.",
  },
  {
    id: "antecedentes",
    label: "Antecedentes psiquiátricos",
    hint: "Tratamentos anteriores, internações, tentativas de suicídio.",
  },
  {
    id: "remedios",
    label: "Remédios já usados",
    hint: "O que funcionou, o que não funcionou e os efeitos colaterais.",
  },
  {
    id: "clinico",
    label: "Doenças clínicas e alergias",
    hint: "Outras doenças, cirurgias, alergias, remédios em uso.",
  },
  {
    id: "substancias",
    label: "Álcool e outras substâncias",
    hint: "O que usa, quanto e com que frequência.",
  },
  { id: "familia", label: "Histórico familiar", hint: "Transtornos mentais e suicídio na família." },
  {
    id: "estadoMental",
    label: "Exame do estado mental",
    hint: "Aparência, humor e afeto, pensamento, sono, apetite, crítica e risco.",
  },
];

/** Os campos da anamnese de cada especialidade. */
export function anamnesisFields(specialty: "psychologist" | "psychiatrist"): Field[] {
  return specialty === "psychiatrist" ? PSYCHIATRY_ANAMNESIS_FIELDS : ANAMNESIS_FIELDS;
}

/** A psicóloga escreveu tudo o que existia antes de o prontuário ser separado por profissional. */
export const LEGACY_PRO_ID = "pro_psi_01";

/** De quem é um registro do prontuário. */
export function ownerOf(item: { proId?: string }): string {
  return item.proId ?? LEGACY_PRO_ID;
}

/** A chave de um registro que é um por paciente (anamnese, valor da sessão): a antiga era só o paciente. */
export function ownKey(proId: string, patientId: string): string {
  return proId === LEGACY_PRO_ID ? patientId : `${proId}:${patientId}`;
}

/** No prontuário do médico o plano se chama conduta, e as situações têm outros nomes. */
export const CONDUCT_STATUS_LABEL: Record<Goal["status"], string> = {
  andamento: "Em vigor",
  alcancado: "Concluída",
  revisto: "Revista",
};

export const ANAMNESIS_FIELDS: Field[] = [
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
  list: Field[] = ANAMNESIS_FIELDS,
): Anamnesis {
  const clean: Partial<Record<AnamnesisField, string>> = {};
  for (const { id } of list) {
    const value = (fields[id] ?? "").trim().slice(0, FIELD_MAX);
    if (value) clean[id] = value;
  }
  const same = current && list.every(({ id }) => (current.fields[id] ?? "") === (clean[id] ?? ""));
  if (same) return current;
  return {
    patientId,
    fields: clean,
    updatedAt: at,
    history: current ? [{ fields: current.fields, until: at }, ...current.history] : [],
  };
}

/** Novo objetivo do plano. `null` quando o texto está vazio. */
export function newGoal(
  patientId: string,
  text: string,
  at: string,
  id: string,
  proId: string = LEGACY_PRO_ID,
): Goal | null {
  const clean = text.trim().slice(0, GOAL_MAX);
  if (!clean) return null;
  return { id, patientId, proId, text: clean, status: "andamento", createdAt: at };
}

/** Objetivo alcançado ou revisto não some do plano: só muda de situação, com a data. */
export function setGoalStatus(goal: Goal, status: Goal["status"], at: string): Goal {
  return goal.status === status ? goal : { ...goal, status, updatedAt: at };
}
