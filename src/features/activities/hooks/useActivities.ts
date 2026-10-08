"use client";

import { grantWater } from "@/features/garden/water";
import { toISODate } from "@/lib/dates";
import { upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cleanNote, makeId } from "../logic";
import type { ActivityKind, ActivityRecord, Answers, Assignment } from "../types";

export const ACTIVITIES_KEY = "psycare:activities:v1";
/** Pedidos de atividade feitos pelo profissional (na demonstração, no mesmo navegador). */
export const ASSIGNMENTS_KEY = "psycare:assignments:v1";

const NO_RECORDS: ActivityRecord[] = [];
const NO_ASSIGNMENTS: Assignment[] = [];

export function useActivities() {
  const [records, setRecords] = useLocalStorage<ActivityRecord[]>(ACTIVITIES_KEY, NO_RECORDS);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>(ASSIGNMENTS_KEY, NO_ASSIGNMENTS);

  /** Guarda uma atividade já validada. Se veio de um pedido, marca o pedido como feito. */
  const saveRecord = (kind: ActivityKind, answers: Answers, note: string, assignmentId?: string) => {
    const record: ActivityRecord = {
      id: makeId("act"),
      kind,
      date: toISODate(new Date()),
      answers,
      note: cleanNote(note),
      assignmentId,
    };
    setRecords((current) => upsertById(current, record));
    if (assignmentId) {
      setAssignments((current) =>
        current.map((item) => (item.id === assignmentId ? { ...item, doneRecordId: record.id } : item)),
      );
    }
    grantWater("diary", record.id);
    return record;
  };

  const removeRecord = (id: string) => {
    setRecords((current) => current.filter((item) => item.id !== id));
    setAssignments((current) =>
      current.map((item) => (item.doneRecordId === id ? { ...item, doneRecordId: undefined } : item)),
    );
  };

  return { records, assignments, saveRecord, removeRecord };
}
