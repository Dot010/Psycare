"use client";

import { useMemo } from "react";
import { useUndo } from "@/components/feedback/UndoProvider";
import { makeId } from "@/features/activities/logic";
import { addDays } from "@/features/health/logic";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { canRequest, currentFor } from "../logic";
import type { Referral } from "../types";

export const REFERRAL_KEY = "psycare:referral:v1";

interface State {
  /** Pedidos feitos neste navegador. */
  created: Referral[];
  /** Mudanças em cima dos encaminhamentos de exemplo. */
  patches: Record<string, Partial<Referral>>;
  /** Pacientes a quem a psicóloga sugeriu pedir um encaminhamento (AAAA-MM-DD). */
  suggested: Record<string, string>;
}
const EMPTY: State = { created: [], patches: {}, suggested: {} };

/** Encaminhamentos de exemplo dos pacientes que não usam o app aqui. */
function demoReferrals(today: string): Referral[] {
  return [
    { id: "enc_m", patientId: "pac_marina", requestedAt: addDays(today, -1), reminders: [] },
    {
      id: "enc_p",
      patientId: "pac_pedro",
      requestedAt: addDays(today, -12),
      issuedAt: addDays(today, -10),
      insurance: "Convênio Exemplo",
      sessions: 12,
      authorizedAt: addDays(today, -4),
      reminders: [],
    },
  ];
}

/** Pedido, emissão, autorização e entrega do encaminhamento. Cada papel usa só as suas ações. */
export function useReferrals() {
  const today = toISODate(new Date());
  const [state, setState] = useLocalStorage(REFERRAL_KEY, EMPTY);
  const { showUndo } = useUndo();

  const referrals: Referral[] = useMemo(
    () => [...state.created, ...demoReferrals(today).map((r) => ({ ...r, ...state.patches[r.id] }))],
    [today, state],
  );

  const patch = (id: string, change: Partial<Referral>) =>
    setState((current) => {
      const own = current.created.some((r) => r.id === id);
      return {
        ...current,
        created: own ? current.created.map((r) => (r.id === id ? { ...r, ...change } : r)) : current.created,
        patches: own ? current.patches : { ...current.patches, [id]: { ...current.patches[id], ...change } },
      };
    });

  /** Paciente: pede um encaminhamento. */
  const request = (patientId: string, note?: string) => {
    if (!canRequest(referrals, patientId)) return;
    const item: Referral = {
      id: makeId("enc"),
      patientId,
      requestedAt: today,
      note: note?.trim().slice(0, 200) || undefined,
      reminders: [],
    };
    setState((current) => {
      const suggested = { ...current.suggested };
      delete suggested[patientId];
      return { ...current, created: [item, ...current.created], suggested };
    });
  };

  /** Paciente: cancela um pedido que o psiquiatra ainda não emitiu. */
  const cancel = (id: string) => patch(id, { canceled: true });

  /** Psiquiatra: registra que o encaminhamento está pronto (o papel vai em mãos). */
  const issue = (id: string) => {
    patch(id, { issuedAt: today });
    showUndo({
      message: "Encaminhamento registrado (simulado).",
      onUndo: () => patch(id, { issuedAt: undefined }),
    });
  };

  /** Paciente: anota que o convênio autorizou, com o nome e as sessões. */
  const authorize = (id: string, insurance: string, sessions: number) =>
    patch(id, { insurance, sessions, authorizedAt: today });

  /** Paciente: anota que entregou o papel à psicóloga. */
  const deliver = (id: string) => patch(id, { deliveredAt: today });

  /** Psicóloga: manda um lembrete gentil. */
  const remind = (id: string, text: string) => {
    const target = referrals.find((r) => r.id === id);
    if (!target) return;
    patch(id, { reminders: [{ at: today, text }, ...target.reminders] });
  };

  /** Psicóloga: sugere que o paciente peça um encaminhamento. */
  const suggest = (patientId: string) =>
    setState((current) => ({ ...current, suggested: { ...current.suggested, [patientId]: today } }));

  return {
    today,
    referrals,
    suggested: state.suggested,
    currentFor: (patientId: string) => currentFor(referrals, patientId),
    request,
    cancel,
    issue,
    authorize,
    deliver,
    remind,
    suggest,
  };
}
