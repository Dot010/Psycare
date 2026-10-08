import type { DiaryEntry } from "@/features/diary/types";
import type { CheckIn } from "@/features/garden/types";
import { addDays, dosesForDay, medTimes, symptomStats } from "@/features/health/logic";
import type { Medicamento, Sintoma } from "@/features/health/types";
import { dailyLevels } from "@/features/mood/logic";
import type { ActivityRecord } from "@/features/activities/types";
import type { MedLine, PatientSnapshot, Sharing } from "./types";

export const DEFAULT_SHARING: Sharing = { mood: true, diary: false, activities: true, health: true };
export const SHARING_KEY = "psycare:sharing:v1";

export interface SnapshotInput {
  sharing: Sharing;
  checkIns: CheckIn[];
  entries: DiaryEntry[];
  activities: ActivityRecord[];
  sintomas: Sintoma[];
  meds: Medicamento[];
  taken: string[];
  today: string;
  days?: number;
}

export function medLines(meds: Medicamento[], taken: string[], today: string): MedLine[] {
  const set = new Set(taken);
  return meds.map((med) => {
    let planned = 0;
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, -i);
      for (const dose of dosesForDay([med], date)) {
        planned++;
        if (set.has(dose.key)) done++;
      }
    }
    return {
      nome: med.nome,
      dosagem: med.dosagem,
      horarios: medTimes(med).join(" · ") || "sem horário",
      taken: done,
      planned,
    };
  });
}

/** Monta a visão do profissional. Só entra o que o paciente deixou compartilhar. */
export function buildSnapshot(input: SnapshotInput): PatientSnapshot {
  const { sharing, today } = input;
  const from = addDays(today, -((input.days ?? 14) - 1));
  const snapshot: PatientSnapshot = {};

  if (sharing.mood) {
    snapshot.moodDays = [...dailyLevels(input.checkIns, input.entries).entries()]
      .filter(([date]) => date >= from && date <= today)
      .map(([date, level]) => ({ date, level }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  if (sharing.diary) {
    snapshot.topics = input.entries
      .filter((entry) => entry.discussInSession)
      .map((entry) => ({ date: entry.date, title: entry.title }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  if (sharing.activities) {
    snapshot.activities = [...input.activities].sort((a, b) => b.date.localeCompare(a.date));
  }
  if (sharing.health) {
    snapshot.symptoms = symptomStats(input.sintomas, addDays(today, -29), today);
    snapshot.meds = medLines(input.meds, input.taken, today);
  }
  return snapshot;
}

export function sharedCount(sharing: Sharing): number {
  return Object.values(sharing).filter(Boolean).length;
}
