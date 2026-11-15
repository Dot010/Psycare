"use client";

import { useMemo } from "react";
import { useActivities, ASSIGNMENTS_KEY } from "@/features/activities/hooks/useActivities";
import type { Assignment } from "@/features/activities/types";
import { APPOINTMENTS_KEY, useAppointments } from "@/features/appointments/hooks/useAppointments";
import { mockUser } from "@/mocks/user";
import { useDiary } from "@/features/diary/hooks/useDiary";
import type { CheckIn } from "@/features/garden/types";
import { CHECKINS_KEY, NO_CHECKINS } from "@/features/garden/water";
import { useHealth } from "@/features/health/hooks/useHealth";
import { toISODate } from "@/lib/dates";
import { upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { demoSessions, demoSnapshot, LIVE_PATIENT_ID, PATIENTS } from "../data";
import { buildSnapshot, DEFAULT_SHARING, SHARING_KEY } from "../snapshot";
import { buildClosing, closingError, evolutionText, type ClosingInput } from "../logic";
import type {
  PatientSnapshot,
  ProAssignment,
  ProSession,
  SessionClosing,
  SessionNote,
  Sharing,
} from "../types";
import { makeId } from "@/features/activities/logic";

export const NOTES_KEY = "psycare:pro:notes:v1";
export const PRO_ASSIGNED_KEY = "psycare:pro:assigned:v1";
export const SESSION_STATUS_KEY = "psycare:pro:sessions:v1";
export const CLOSINGS_KEY = "psycare:pro:closings:v1";

const NO_NOTES: SessionNote[] = [];
const NO_ASSIGNED: ProAssignment[] = [];
const NO_STATUS: Record<string, ProSession["status"]> = {};
const NO_CLOSINGS: SessionClosing[] = [];

/** O que o profissional preencheu no "Encerrar sessão". */
export interface CloseSessionInput extends ClosingInput {
  paid: boolean;
  /** Tarefa para casa, opcional: vira um pedido em Atividades do paciente. */
  homework?: { kind: ProAssignment["kind"]; dueDate: string };
  /** Quem está encerrando (aparece no pedido da tarefa). */
  by: string;
}

/** Preferência do paciente sobre o que o profissional pode ver. */
export function useSharing() {
  return useLocalStorage<Sharing>(SHARING_KEY, DEFAULT_SHARING);
}

/** Tudo o que a área do profissional precisa. Roda no mesmo navegador do paciente de demonstração. */
export function usePro() {
  const today = toISODate(new Date());
  const [sharing] = useSharing();
  const [checkIns] = useLocalStorage<CheckIn[]>(CHECKINS_KEY, NO_CHECKINS);
  const { entries } = useDiary();
  const { records } = useActivities();
  const health = useHealth();
  const { appointments, setStatus } = useAppointmentsAdmin();

  const [notes, setNotes] = useLocalStorage<SessionNote[]>(NOTES_KEY, NO_NOTES);
  const [assigned, setAssigned] = useLocalStorage<ProAssignment[]>(PRO_ASSIGNED_KEY, NO_ASSIGNED);
  const [, setPatientAssignments] = useLocalStorage<Assignment[]>(ASSIGNMENTS_KEY, []);
  const [statusMap, setStatusMap] = useLocalStorage(SESSION_STATUS_KEY, NO_STATUS);
  const [closings, setClosings] = useLocalStorage<SessionClosing[]>(CLOSINGS_KEY, NO_CLOSINGS);

  const sessions: ProSession[] = useMemo(
    () => demoSessions(today).map((s) => ({ ...s, status: statusMap[s.id] ?? s.status })),
    [today, statusMap],
  );

  const snapshotOf = (patientId: string): PatientSnapshot | null => {
    if (patientId === LIVE_PATIENT_ID) {
      return buildSnapshot({
        sharing,
        checkIns,
        entries,
        activities: records,
        sintomas: health.sintomas,
        meds: health.remedios,
        taken: health.taken,
        today,
      });
    }
    return demoSnapshot(patientId, today);
  };

  const addNote = (patientId: string, text: string, sessionId?: string) => {
    const clean = text.trim().slice(0, 4000);
    if (!clean) return;
    setNotes((current) => [
      { id: makeId("nota"), patientId, date: today, text: clean, sessionId },
      ...current,
    ]);
  };
  const removeNote = (id: string) => setNotes((current) => current.filter((n) => n.id !== id));

  const assign = (
    patientId: string,
    kind: ProAssignment["kind"],
    dueDate: string,
    message: string,
    by: string,
  ) => {
    const item: ProAssignment = {
      id: makeId("pedido"),
      patientId,
      kind,
      assignedAt: today,
      dueDate: dueDate || undefined,
      message: message.trim().slice(0, 300) || undefined,
    };
    setAssigned((current) => upsertById(current, item));
    // O paciente de demonstração recebe o pedido na tela de Atividades.
    if (patientId === LIVE_PATIENT_ID) {
      setPatientAssignments((current) => [
        { id: item.id, kind, by, assignedAt: today, dueDate: item.dueDate, message: item.message },
        ...current,
      ]);
    }
  };

  const setSessionStatus = (id: string, status: ProSession["status"]) =>
    setStatusMap((current) => ({ ...current, [id]: status }));

  /**
   * Encerrar sessão: um passo só que hoje eram três soltos.
   * Marca realizada ou falta, guarda a evolução no prontuário, lança a cobrança
   * e, se tiver, manda a tarefa para casa. Devolve o erro, se faltar algo.
   */
  const closeSession = (session: ProSession, input: CloseSessionInput): string | null => {
    const error = closingError(input);
    if (error) return error;
    const fee = PATIENTS.find((p) => p.id === session.patientId)?.fee ?? 0;
    const closing = buildClosing(session, input, fee);
    setSessionStatus(session.id, closing.outcome);
    addNote(session.patientId, evolutionText(session, input), session.id);
    setClosings((current) => [...current.filter((c) => c.sessionId !== session.id), closing]);
    if (input.homework && closing.outcome === "realizada") {
      assign(session.patientId, input.homework.kind, input.homework.dueDate, "", input.by);
    }
    return null;
  };

  return {
    today,
    patients: PATIENTS,
    sharing,
    sessions,
    patientRequests: appointments.filter((a) => a.status === "pendente"),
    answerRequest: setStatus,
    notes,
    addNote,
    removeNote,
    assigned,
    assign,
    setSessionStatus,
    closings,
    closeSession,
    snapshotOf,
    activities: records,
  };
}

/** Acesso do profissional aos pedidos de consulta que o paciente de demonstração fez. */
function useAppointmentsAdmin() {
  const { appointments } = useAppointments();
  const [, setAppointments] = useLocalStorage<typeof appointments>(APPOINTMENTS_KEY, mockUser.agendamentos);
  const setStatus = (id: string, status: "confirmado" | "cancelado") =>
    setAppointments((current) => current.map((a) => (a.id === id ? { ...a, status } : a)));
  return { appointments, setStatus };
}
