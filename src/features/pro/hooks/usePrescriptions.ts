"use client";

import { useMemo } from "react";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { makeId } from "@/features/activities/logic";
import { demoExams, demoPrescriptions } from "../data";
import { nextStep, renewedUntil } from "../exams";
import type { ExamRequest, Prescription } from "../types";

export const PRESCRIPTION_CHANGES_KEY = "psycare:pro:prescriptions:v1";
export const EXAM_CHANGES_KEY = "psycare:pro:exams:v1";

type PrescriptionChange = Partial<Pick<Prescription, "validUntil" | "status" | "note">>;
interface ExamChanges {
  /** Pedidos novos feitos aqui. */
  added: ExamRequest[];
  /** Etapa e resultado dos exames de exemplo que já avançaram. */
  progress: Record<string, Pick<ExamRequest, "step" | "result">>;
}

const NO_PRESCRIPTION_CHANGES: Record<string, PrescriptionChange> = {};
const NO_EXAM_CHANGES: ExamChanges = { added: [], progress: {} };

/** Receitas e exames de exemplo do psiquiatra. Só guarda o que mudou, o resto vem da demonstração. */
export function usePrescriptions() {
  const today = toISODate(new Date());
  const [changes, setChanges] = useLocalStorage(PRESCRIPTION_CHANGES_KEY, NO_PRESCRIPTION_CHANGES);
  const [examChanges, setExamChanges] = useLocalStorage(EXAM_CHANGES_KEY, NO_EXAM_CHANGES);

  const prescriptions: Prescription[] = useMemo(
    () => demoPrescriptions(today).map((p) => ({ ...p, ...changes[p.id] })),
    [today, changes],
  );

  const exams: ExamRequest[] = useMemo(
    () => [...examChanges.added, ...demoExams(today).map((e) => ({ ...e, ...examChanges.progress[e.id] }))],
    [today, examChanges],
  );

  const change = (id: string, patch: PrescriptionChange) =>
    setChanges((current) => ({ ...current, [id]: { ...current[id], ...patch } }));

  const renew = (id: string) => change(id, { validUntil: renewedUntil(today), status: "active" });
  const suspend = (id: string) => change(id, { status: "suspended", note: "Suspensa hoje (simulado)." });
  const adjust = (id: string) => change(id, { note: "Dose em ajuste: definir o novo valor na consulta." });

  const requestExam = (patientId: string, nome: string) =>
    setExamChanges((current) => ({
      ...current,
      added: [{ id: makeId("exame"), patientId, nome, requestedAt: today, step: 1 }, ...current.added],
    }));

  const advanceExam = (exam: ExamRequest) => {
    const step = nextStep(exam.step);
    const result =
      step === 3 ? "Resultado registrado (exemplo). Anote a sua leitura na consulta." : exam.result;
    setExamChanges((current) =>
      current.added.some((e) => e.id === exam.id)
        ? { ...current, added: current.added.map((e) => (e.id === exam.id ? { ...e, step, result } : e)) }
        : { ...current, progress: { ...current.progress, [exam.id]: { step, result } } },
    );
  };

  return { today, prescriptions, exams, renew, suspend, adjust, requestExam, advanceExam };
}
