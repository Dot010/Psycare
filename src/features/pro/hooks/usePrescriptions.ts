"use client";

import { useMemo } from "react";
import { useUndo } from "@/components/feedback/UndoProvider";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { makeId } from "@/features/activities/logic";
import { demoConsultations, demoPrescriptions, demoRequests, demoSessions, patientById } from "../data";
import { detectChange, eligibleConsultations, nextStep, type PrescriptionDraft } from "../prescriptionRules";
import { SESSION_STATUS_KEY } from "./usePro";
import type {
  Consultation,
  PatientNotice,
  PatientStep,
  Prescription,
  PrescriptionChange,
  PrescriptionOrigin,
  PrescriptionRequest,
  RequestAnswer,
} from "../types";

/**
 * Receitas, pedidos e avisos. O psiquiatra registra e responde; o paciente pede e acompanha.
 * Os passos "retirei" e "comprei" ficam em outra chave, porque são só do paciente.
 */
export const RX_STATE_KEY = "psycare:rx:v3";
export const RX_STEPS_KEY = "psycare:rx:steps:v1";

interface RxState {
  /** Receitas registradas aqui (as de exemplo vêm da demonstração). */
  prepared: Prescription[];
  /** Receitas de exemplo que o médico suspendeu. */
  patches: Record<string, Pick<Prescription, "status" | "change" | "changeNote">>;
  /** Pedidos feitos pelo paciente neste navegador. */
  requests: PrescriptionRequest[];
  /** Respostas do médico, por pedido (vale para os de exemplo também). */
  answers: Record<string, RequestAnswer>;
  /** Pedidos que o paciente cancelou. */
  canceled: Record<string, true>;
  notices: PatientNotice[];
}

const NO_SESSION_STATUS: Record<string, string> = {};
const EMPTY_RX: RxState = { prepared: [], patches: {}, requests: [], answers: {}, canceled: {}, notices: [] };
const NO_STEPS: Record<string, PatientStep> = {};

export interface RegisterInput {
  draft: PrescriptionDraft;
  origin: PrescriptionOrigin;
  /** O que o psiquiatra marcou; se vazio, o app compara com a receita anterior. */
  change?: PrescriptionChange;
  changeNote?: string;
}

export function usePrescriptions() {
  const today = toISODate(new Date());
  const { showUndo } = useUndo();
  const [rx, setRx] = useLocalStorage(RX_STATE_KEY, EMPTY_RX);
  const [steps, setSteps] = useLocalStorage(RX_STEPS_KEY, NO_STEPS);
  const [sessionStatus] = useLocalStorage<Record<string, string>>(SESSION_STATUS_KEY, NO_SESSION_STATUS);

  const prescriptions: Prescription[] = useMemo(
    () => [...rx.prepared, ...demoPrescriptions(today).map((p) => ({ ...p, ...rx.patches[p.id] }))],
    [today, rx],
  );

  const allRequests: PrescriptionRequest[] = useMemo(
    () =>
      [...rx.requests, ...demoRequests(today)]
        .filter((r) => !rx.canceled[r.id])
        .map((r) => ({ ...r, answer: rx.answers[r.id] ?? r.answer })),
    [today, rx],
  );
  /** Pedidos que o psiquiatra ainda não respondeu. */
  const pendingRequests = allRequests.filter((r) => !r.answer);

  /** Consultas já feitas, mais as de hoje na agenda que não foram canceladas. */
  const consultations: Consultation[] = useMemo(() => {
    const fromAgenda: Consultation[] = demoSessions(today)
      .map((session) => ({ session, status: sessionStatus[session.id] ?? session.status }))
      .filter(
        ({ session, status }) => session.data <= today && (status === "realizada" || status === "confirmado"),
      )
      .map(({ session, status }) => ({
        id: session.id,
        patientId: session.patientId,
        date: session.data,
        hora: session.hora,
        status: status as Consultation["status"],
      }));
    return [...demoConsultations(today), ...fromAgenda];
  }, [today, sessionStatus]);

  const consultationsFor = (last: Prescription) => eligibleConsultations(consultations, last, today);

  /** Última receita do mesmo remédio do mesmo paciente (para comparar a dose). */
  const lastOf = (patientId: string, nome: string) =>
    prescriptions
      .filter((p) => p.patientId === patientId && p.nome.trim().toLowerCase() === nome.trim().toLowerCase())
      .sort((a, b) => b.preparedAt.localeCompare(a.preparedAt))[0];

  const notice = (patientId: string, text: string): PatientNotice => ({
    id: makeId("aviso"),
    patientId,
    text,
    at: today,
  });

  /** O psiquiatra registra que deixou (ou entregou) a receita. Nada é enviado: o papel é entregue em mãos. */
  const register = ({ draft, origin, change, changeNote }: RegisterInput) => {
    const previous = lastOf(draft.patientId, draft.nome);
    const prescription: Prescription = {
      id: makeId("rec"),
      ...draft,
      origin,
      preparedAt: today,
      status: "ready",
      change: change ?? detectChange(previous, draft),
      changeNote: changeNote?.trim() || undefined,
    };
    const aviso = notice(
      draft.patientId,
      `Sua receita de ${draft.nome} está pronta. Retire no consultório. Use de ${draft.useFrom.split("-").reverse().join("/")} a ${draft.useUntil.split("-").reverse().join("/")}.`,
    );
    const requestId = origin.type === "request" ? origin.requestId : undefined;
    const answer: RequestAnswer | undefined = requestId
      ? { kind: "ready", at: today, prescriptionId: prescription.id }
      : undefined;
    setRx((current) => ({
      ...current,
      prepared: [prescription, ...current.prepared],
      answers: requestId && answer ? { ...current.answers, [requestId]: answer } : current.answers,
      notices: [aviso, ...current.notices],
    }));
    showUndo({
      message: "Receita registrada (simulado).",
      onUndo: () =>
        setRx((current) => ({
          ...current,
          prepared: current.prepared.filter((p) => p.id !== prescription.id),
          notices: current.notices.filter((n) => n.id !== aviso.id),
          answers: requestId ? withoutKey(current.answers, requestId) : current.answers,
        })),
    });
    return prescription;
  };

  /** O médico suspendeu o remédio: não se registra receita nova. */
  const stop = (prescription: Prescription, note: string, requestId?: string) => {
    const patch = {
      status: "stopped" as const,
      change: "stop" as const,
      changeNote: note.trim() || undefined,
    };
    setRx((current) => {
      const own = current.prepared.some((p) => p.id === prescription.id);
      return {
        ...current,
        prepared: own
          ? current.prepared.map((p) => (p.id === prescription.id ? { ...p, ...patch } : p))
          : current.prepared,
        patches: own ? current.patches : { ...current.patches, [prescription.id]: patch },
        answers: requestId
          ? { ...current.answers, [requestId]: { kind: "no", reason: "Remédio suspenso", at: today } }
          : current.answers,
        notices: [
          notice(
            prescription.patientId,
            `${prescription.nome} foi suspenso na consulta. Não pare nem volte por conta própria.`,
          ),
          ...current.notices,
        ],
      };
    });
  };

  /** Responde um pedido sem registrar receita: pede consulta, ou diz que não por agora. */
  const answerRequest = (request: PrescriptionRequest, kind: "consult" | "no", reason?: string) => {
    const text =
      kind === "consult"
        ? `Seu psiquiatra pede uma consulta antes de fazer a receita de ${request.nome}.`
        : `Seu psiquiatra não fará a receita de ${request.nome} por agora. ${reason ? reason + "." : "Vamos conversar na próxima consulta."}`;
    const aviso = notice(request.patientId, text);
    setRx((current) => ({
      ...current,
      answers: { ...current.answers, [request.id]: { kind, reason, at: today } },
      notices: [aviso, ...current.notices],
    }));
    showUndo({
      message: "Resposta enviada ao paciente (simulado).",
      onUndo: () =>
        setRx((current) => ({
          ...current,
          answers: withoutKey(current.answers, request.id),
          notices: current.notices.filter((n) => n.id !== aviso.id),
        })),
    });
  };

  /** O paciente pede uma nova receita de um remédio que já usa. */
  const requestNew = (patientId: string, nome: string, note?: string) =>
    setRx((current) => ({
      ...current,
      requests: [
        { id: makeId("ped"), patientId, nome, requestedAt: today, note: note?.trim() || undefined },
        ...current.requests,
      ],
    }));

  const cancelRequest = (id: string) =>
    setRx((current) => ({ ...current, canceled: { ...current.canceled, [id]: true } }));

  /** Só o paciente: avança "retirei" e depois "comprei" para uma receita. */
  const advanceStep = (prescriptionId: string) =>
    setSteps((current) => {
      const next = nextStep(current[prescriptionId]);
      return next ? { ...current, [prescriptionId]: next } : current;
    });

  return {
    today,
    prescriptions,
    allRequests,
    pendingRequests,
    notices: rx.notices,
    steps,
    consultations,
    consultationsFor,
    lastOf,
    register,
    stop,
    answerRequest,
    requestNew,
    cancelRequest,
    advanceStep,
    patientName: (id: string) => patientById(id)?.name ?? "Paciente",
  };
}

function withoutKey<T extends Record<string, unknown>>(obj: T, key: string): T {
  const { [key]: removed, ...rest } = obj;
  void removed;
  return rest as T;
}
