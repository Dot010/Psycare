"use client";

import { useMemo } from "react";
import { useUndo } from "@/components/feedback/UndoProvider";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { makeId } from "@/features/activities/logic";
import { demoPrescriptions, demoRequests, patientById } from "../data";
import { detectChange, type PrescriptionDraft } from "../prescriptionRules";
import type { PatientNotice, Prescription, PrescriptionChange, PrescriptionRequest } from "../types";

/** Receitas, pedidos e avisos. O paciente e o psiquiatra leem e escrevem aqui. */
export const RX_STATE_KEY = "psycare:rx:v2";

interface RxState {
  /** Receitas emitidas aqui (as de exemplo vêm da demonstração). */
  issued: Prescription[];
  /** Mudanças de estado nas receitas de exemplo: "já comprei" ou suspensa. */
  patches: Record<string, Pick<Prescription, "status" | "change" | "changeNote">>;
  /** Pedidos feitos pelo paciente neste navegador. */
  requests: PrescriptionRequest[];
  /** Pedidos já atendidos. */
  handled: Record<string, true>;
  notices: PatientNotice[];
}

const EMPTY_RX: RxState = { issued: [], patches: {}, requests: [], handled: {}, notices: [] };

export interface IssueInput {
  draft: PrescriptionDraft;
  /** O que o psiquiatra marcou; se vazio, o app compara com a receita anterior. */
  change?: PrescriptionChange;
  changeNote?: string;
  /** Se veio de um pedido do paciente, ele sai da caixa de pedidos. */
  requestId?: string;
}

/** Receitas e exames de exemplo do psiquiatra. Só guarda o que mudou, o resto vem da demonstração. */
export function usePrescriptions() {
  const today = toISODate(new Date());
  const { showUndo } = useUndo();
  const [rx, setRx] = useLocalStorage(RX_STATE_KEY, EMPTY_RX);

  const prescriptions: Prescription[] = useMemo(
    () => [...rx.issued, ...demoPrescriptions(today).map((p) => ({ ...p, ...rx.patches[p.id] }))],
    [today, rx],
  );

  const requests: PrescriptionRequest[] = useMemo(
    () => [...rx.requests, ...demoRequests(today)].filter((r) => !rx.handled[r.id]),
    [today, rx],
  );

  /** Última receita do mesmo remédio do mesmo paciente (para comparar a dose). */
  const lastOf = (patientId: string, nome: string) =>
    prescriptions
      .filter((p) => p.patientId === patientId && p.nome.trim().toLowerCase() === nome.trim().toLowerCase())
      .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate))[0];

  const issue = ({ draft, change, changeNote, requestId }: IssueInput) => {
    const previous = lastOf(draft.patientId, draft.nome);
    const detected = detectChange(previous, draft);
    const prescription: Prescription = {
      id: makeId("rec"),
      ...draft,
      status: "issued",
      change: change ?? detected,
      changeNote: changeNote?.trim() || undefined,
    };
    const notice: PatientNotice = {
      id: makeId("aviso"),
      patientId: draft.patientId,
      prescriptionId: prescription.id,
      text: `Nova receita de ${draft.nome} ${draft.dosagem.split(",")[0]}.`,
      at: today,
    };
    setRx((current) => ({
      ...current,
      issued: [prescription, ...current.issued],
      handled: requestId ? { ...current.handled, [requestId]: true } : current.handled,
      notices: [notice, ...current.notices],
    }));
    showUndo({
      message: "Receita emitida (simulado).",
      onUndo: () =>
        setRx((current) => ({
          ...current,
          issued: current.issued.filter((p) => p.id !== prescription.id),
          notices: current.notices.filter((n) => n.id !== notice.id),
          handled: requestId ? withoutKey(current.handled, requestId) : current.handled,
        })),
    });
    return prescription;
  };

  /** O médico suspendeu o remédio na consulta: não se emite receita nova. */
  const stop = (prescription: Prescription, note: string, requestId?: string) => {
    const patch = {
      status: "stopped" as const,
      change: "stop" as const,
      changeNote: note.trim() || undefined,
    };
    setRx((current) => {
      const isIssued = current.issued.some((p) => p.id === prescription.id);
      return {
        ...current,
        issued: isIssued
          ? current.issued.map((p) => (p.id === prescription.id ? { ...p, ...patch } : p))
          : current.issued,
        patches: isIssued ? current.patches : { ...current.patches, [prescription.id]: patch },
        handled: requestId ? { ...current.handled, [requestId]: true } : current.handled,
        notices: [
          {
            id: makeId("aviso"),
            patientId: prescription.patientId,
            prescriptionId: prescription.id,
            text: `${prescription.nome} foi suspenso na consulta. Não pare ou volte por conta própria.`,
            at: today,
          },
          ...current.notices,
        ],
      };
    });
  };

  /** O paciente avisa que já comprou. */
  const markUsed = (id: string) =>
    setRx((current) =>
      current.issued.some((p) => p.id === id)
        ? { ...current, issued: current.issued.map((p) => (p.id === id ? { ...p, status: "used" } : p)) }
        : { ...current, patches: { ...current.patches, [id]: { status: "used", change: "none" } } },
    );

  /** O paciente pede uma nova receita. */
  const requestNew = (patientId: string, nome: string, note?: string) =>
    setRx((current) => ({
      ...current,
      requests: [
        { id: makeId("ped"), patientId, nome, requestedAt: today, note: note?.trim() || undefined },
        ...current.requests,
      ],
    }));

  return {
    today,
    prescriptions,
    requests,
    notices: rx.notices,
    lastOf,
    issue,
    stop,
    markUsed,
    requestNew,
    patientName: (id: string) => patientById(id)?.name ?? "Paciente",
  };
}

function withoutKey<T extends Record<string, true>>(obj: T, key: string): T {
  const { [key]: _removed, ...rest } = obj;
  void _removed;
  return rest as T;
}
