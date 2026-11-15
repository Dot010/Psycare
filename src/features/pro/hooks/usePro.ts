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
import { demoSessionsFor, demoSnapshot, LIVE_PATIENT_ID, PATIENTS } from "../data";
import { buildSnapshot, DEFAULT_SHARING, SHARING_KEY } from "../snapshot";
import { buildClosing, closingError, conductText, evolutionText, type ClosingInput } from "../logic";
import {
  anamnesisFields,
  editNote as withEdit,
  LEGACY_PRO_ID,
  newGoal,
  ownerOf,
  ownKey,
  setGoalStatus as withStatus,
  stamp,
  updateAnamnesis,
} from "../prontuario";
import type {
  Anamnesis,
  AnamnesisField,
  Goal,
  PatientSnapshot,
  ProAssignment,
  ProSession,
  SessionClosing,
  SessionNote,
  Sharing,
} from "../types";
import { makeId } from "@/features/activities/logic";
import type { Agendamento } from "@/features/appointments/types";
import { useMaybeProIdentity } from "../components/ProIdentity";

/** As consultas que o paciente de demonstração marcou viram sessões na agenda do profissional dele. */
export const LIVE_SESSION_PREFIX = "ag_";

export function liveSessions(
  appointments: Agendamento[],
  professionalName: string | null,
  today: string,
  statusMap: Record<string, ProSession["status"]>,
): ProSession[] {
  return appointments
    .filter((a) => a.status === "confirmado" && (!professionalName || a.profissional === professionalName))
    .map((a) => {
      const id = `${LIVE_SESSION_PREFIX}${a.id}`;
      return {
        id,
        patientId: LIVE_PATIENT_ID,
        data: a.data,
        hora: a.hora,
        tipo: a.tipo,
        // Consulta confirmada que já passou conta como feita (histórico da demonstração).
        status: statusMap[id] ?? (a.data < today ? "realizada" : "confirmado"),
      };
    });
}

export const NOTES_KEY = "psycare:pro:notes:v1";
export const PRO_ASSIGNED_KEY = "psycare:pro:assigned:v1";
export const SESSION_STATUS_KEY = "psycare:pro:sessions:v1";
export const CLOSINGS_KEY = "psycare:pro:closings:v1";
export const ANAMNESIS_KEY = "psycare:pro:anamnesis:v1";
export const GOALS_KEY = "psycare:pro:goals:v1";
export const FEES_KEY = "psycare:pro:fees:v1";

const NO_NOTES: SessionNote[] = [];
const NO_ASSIGNED: ProAssignment[] = [];
const NO_STATUS: Record<string, ProSession["status"]> = {};
const NO_CLOSINGS: SessionClosing[] = [];
const NO_ANAMNESIS: Record<string, Anamnesis> = {};
const NO_GOALS: Goal[] = [];
const NO_FEES: Record<string, number> = {};
/** Limite do valor da sessão, só para evitar erro de digitação (um zero a mais). */
export const FEE_MAX = 5000;

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
  const me = useMaybeProIdentity();
  const myName = me?.name ?? null;
  const isMine = (a: Agendamento) => !myName || a.profissional === myName;
  // Cada profissional tem o seu prontuário, a sua agenda e o seu financeiro.
  const myId = me?.id ?? LEGACY_PRO_ID;
  const specialty = me?.specialty ?? "psychologist";
  const mine = (item: { proId?: string }) => ownerOf(item) === myId;

  const [notes, setNotes] = useLocalStorage<SessionNote[]>(NOTES_KEY, NO_NOTES);
  const [assigned, setAssigned] = useLocalStorage<ProAssignment[]>(PRO_ASSIGNED_KEY, NO_ASSIGNED);
  const [, setPatientAssignments] = useLocalStorage<Assignment[]>(ASSIGNMENTS_KEY, []);
  const [statusMap, setStatusMap] = useLocalStorage(SESSION_STATUS_KEY, NO_STATUS);
  const [closings, setClosings] = useLocalStorage<SessionClosing[]>(CLOSINGS_KEY, NO_CLOSINGS);
  const [anamneses, setAnamneses] = useLocalStorage<Record<string, Anamnesis>>(ANAMNESIS_KEY, NO_ANAMNESIS);
  const [goals, setGoals] = useLocalStorage<Goal[]>(GOALS_KEY, NO_GOALS);
  const [fees, setFees] = useLocalStorage<Record<string, number>>(FEES_KEY, NO_FEES);

  /** Valor da sessão de cada paciente: o que o profissional definiu, ou o de exemplo. */
  const patients = useMemo(
    () => PATIENTS.map((p) => ({ ...p, fee: fees[ownKey(myId, p.id)] ?? p.fee })),
    [fees, myId],
  );
  const setFee = (patientId: string, value: number) => {
    if (!Number.isFinite(value) || value < 0 || value > FEE_MAX) return;
    setFees((current) => ({ ...current, [ownKey(myId, patientId)]: Math.round(value * 100) / 100 }));
  };
  /** Cobrança pendente que foi paga depois. Só existe para o que nasceu no "Encerrar sessão". */
  const markPaid = (sessionId: string) =>
    setClosings((current) =>
      current.map((c) => (c.sessionId === sessionId && ownerOf(c) === myId ? { ...c, paid: true } : c)),
    );

  const sessions: ProSession[] = useMemo(
    () => [
      ...demoSessionsFor(today, specialty).map((s) => ({
        ...s,
        status: statusMap[ownKey(myId, s.id)] ?? s.status,
      })),
      ...liveSessions(appointments, myName, today, statusMap),
    ],
    [today, statusMap, appointments, myName, myId, specialty],
  );
  // As cobranças do paciente de demonstração são de quem atendeu: cada profissional vê só as suas.
  const myClosings = closings.filter(
    (c) =>
      mine(c) && (!c.sessionId.startsWith(LIVE_SESSION_PREFIX) || sessions.some((s) => s.id === c.sessionId)),
  );
  const myNotes = notes.filter(mine);
  const myGoals = goals.filter(mine);
  // A anamnese é uma por paciente e por profissional; quem usa recebe só as suas, pela chave do paciente.
  const myAnamneses = Object.fromEntries(
    PATIENTS.flatMap((p) => {
      const own = anamneses[ownKey(myId, p.id)];
      return own ? [[p.id, own]] : [];
    }),
  ) as Record<string, Anamnesis>;

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
      { id: makeId("nota"), patientId, proId: myId, date: today, text: clean, sessionId },
      ...current,
    ]);
  };
  // Não existe "apagar" no prontuário (CFP 1/2009): corrigir guarda a versão anterior.
  const editNote = (id: string, text: string) =>
    setNotes((current) => current.map((n) => (n.id === id ? withEdit(n, text, stamp(new Date())) : n)));

  const saveAnamnesis = (patientId: string, fields: Partial<Record<AnamnesisField, string>>) =>
    setAnamneses((current) => {
      const key = ownKey(myId, patientId);
      return {
        ...current,
        [key]: updateAnamnesis(
          current[key],
          patientId,
          fields,
          stamp(new Date()),
          anamnesisFields(specialty),
        ),
      };
    });

  const addGoal = (patientId: string, text: string) => {
    const goal = newGoal(patientId, text, today, makeId("objetivo"), myId);
    if (goal) setGoals((current) => [...current, goal]);
  };
  const setGoalStatus = (id: string, status: Goal["status"]) =>
    setGoals((current) => current.map((g) => (g.id === id ? withStatus(g, status, today) : g)));

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

  const setSessionStatus = (id: string, status: ProSession["status"]) => {
    // As consultas do paciente de demonstração já são de um profissional só; as de exemplo, cada um tem as suas.
    const key = id.startsWith(LIVE_SESSION_PREFIX) ? id : ownKey(myId, id);
    setStatusMap((current) => ({ ...current, [key]: status }));
    // Cancelar a consulta do paciente de demonstração também cancela do lado dele.
    if (id.startsWith(LIVE_SESSION_PREFIX) && status === "cancelado")
      setStatus(id.slice(LIVE_SESSION_PREFIX.length), "cancelado");
  };

  /**
   * Encerrar sessão: um passo só que hoje eram três soltos.
   * Marca realizada ou falta, guarda a evolução no prontuário, lança a cobrança
   * e, se tiver, manda a tarefa para casa. Devolve o erro, se faltar algo.
   */
  const closeSession = (session: ProSession, input: CloseSessionInput): string | null => {
    const error = closingError(input);
    if (error) return error;
    const fee = patients.find((p) => p.id === session.patientId)?.fee ?? 0;
    const closing = { ...buildClosing(session, input, fee), proId: myId };
    setSessionStatus(session.id, closing.outcome);
    addNote(session.patientId, evolutionText(session, input), session.id);
    setClosings((current) => [
      ...current.filter((c) => !(c.sessionId === session.id && ownerOf(c) === myId)),
      closing,
    ]);
    // A conduta do psiquiatra também fica na aba Conduta, com a data da consulta.
    if (input.conduct && closing.outcome === "realizada") {
      const goal = newGoal(
        session.patientId,
        conductText(input.conduct, input.conductNote)
          .replace(/^Conduta: /, "")
          .replace(/^./, (c) => c.toUpperCase()),
        session.data,
        makeId("conduta"),
        myId,
      );
      if (goal) setGoals((current) => [...current, goal]);
    }
    if (input.homework && closing.outcome === "realizada") {
      assign(session.patientId, input.homework.kind, input.homework.dueDate, "", input.by);
    }
    return null;
  };

  return {
    today,
    patients,
    setFee,
    markPaid,
    sharing,
    sessions,
    // Cada profissional só vê os pedidos de consulta feitos para ele.
    patientRequests: appointments.filter((a) => a.status === "pendente" && isMine(a)),
    answerRequest: setStatus,
    notes: myNotes,
    addNote,
    editNote,
    anamneses: myAnamneses,
    saveAnamnesis,
    goals: myGoals,
    addGoal,
    setGoalStatus,
    assigned,
    assign,
    setSessionStatus,
    closings: myClosings,
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
