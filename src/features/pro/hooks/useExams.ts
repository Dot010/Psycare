"use client";

import { useMemo } from "react";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { makeId } from "@/features/activities/logic";
import { demoExams } from "../data";
import { nextStep } from "../exams";
import type { ExamRequest } from "../types";

export const EXAM_CHANGES_KEY = "psycare:pro:exams:v1";

interface ExamChanges {
  /** Pedidos novos feitos aqui. */
  added: ExamRequest[];
  /** Etapa e resultado dos exames de exemplo que já avançaram. */
  progress: Record<string, Pick<ExamRequest, "step" | "result">>;
}

const NO_EXAM_CHANGES: ExamChanges = { added: [], progress: {} };

/** Exames de exemplo do psiquiatra. Só guarda o que mudou, o resto vem da demonstração. */
export function useExams() {
  const today = toISODate(new Date());
  const [examChanges, setExamChanges] = useLocalStorage(EXAM_CHANGES_KEY, NO_EXAM_CHANGES);

  const exams: ExamRequest[] = useMemo(
    () => [...examChanges.added, ...demoExams(today).map((e) => ({ ...e, ...examChanges.progress[e.id] }))],
    [today, examChanges],
  );

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

  return { exams, requestExam, advanceExam };
}
