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
import type { PatientSnapshot, ProAssignment, ProSession, SessionNote, Sharing } from "../types";
import { makeId } from "@/features/activities/logic";

export const NOTES_KEY = "psycare:pro:notes:v1";
export const PRO_ASSIGNED_KEY = "psycare:pro:assigned:v1";
export const SESSION_STATUS_KEY = "psycare:pro:sessions:v1";

const NO_NOTES: SessionNote[] = [];
const NO_ASSIGNED: ProAssignment[] = [];
const NO_STATUS: Record<string, ProSession["status"]> = {};

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

  const addNote = (patientId: string, text: string) => {
    const clean = text.trim().slice(0, 2000);
    if (!clean) return;
    setNotes((current) => [{ id: makeId("nota"), patientId, date: today, text: clean }, ...current]);
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
