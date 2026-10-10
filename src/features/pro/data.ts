import type { ActivityRecord } from "@/features/activities/types";
import { WHEEL_AREAS } from "@/features/activities/catalog";
import { addDays } from "@/features/health/logic";
import type {
  ExamRequest,
  Patient,
  PatientSnapshot,
  Prescription,
  PrescriptionRequest,
  ProSession,
} from "./types";

/** Pacientes fictícios da demonstração. O primeiro usa o app neste navegador; os outros são só exemplo. */
export const LIVE_PATIENT_ID = "usr_01";

export const PATIENTS: Patient[] = [
  { id: LIVE_PATIENT_ID, name: "Usuário Demonstração", age: 32, since: "2026-06-10", live: true, fee: 180 },
  { id: "pac_marina", name: "Marina Costa", age: 28, since: "2026-03-02", fee: 180 },
  { id: "pac_pedro", name: "Pedro Alves", age: 41, since: "2025-11-18", fee: 220 },
  { id: "pac_lucia", name: "Lúcia Fernandes", age: 35, since: "2026-08-25", fee: 180 },
];

export function patientById(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}

function series(today: string, levels: number[]): { date: string; level: number }[] {
  return levels.map((level, i) => ({ date: addDays(today, i - (levels.length - 1)), level }));
}

function wheel(id: string, date: string, scores: number[]): ActivityRecord {
  return { id, kind: "wheel", date, answers: Object.fromEntries(WHEEL_AREAS.map((a, i) => [a, scores[i]])) };
}

/** Dados de exemplo dos pacientes que não usam o app aqui. `null` = ainda não existe visão (use o paciente real). */
export function demoSnapshot(id: string, today: string): PatientSnapshot | null {
  switch (id) {
    case "pac_marina":
      return {
        moodDays: series(today, [2, 2, 3, 3, 2, 3, 4, 3, 4, 4, 3, 4, 5, 4]),
        topics: [{ date: addDays(today, -2), title: "Discussão com a chefe" }],
        activities: [
          wheel("m-roda", addDays(today, -12), [5, 6, 4, 3, 3, 5, 6, 6]),
          {
            id: "m-pens",
            kind: "thoughts",
            date: addDays(today, -6),
            answers: {
              situation: "Atrasei uma entrega",
              thought: "Vão achar que eu não sirvo para isso",
              emotion: "Medo",
              intensity: 8,
              after: 5,
            },
          },
        ],
        symptoms: [{ nome: "Insônia", vezes: 6, media: 3.2, maxima: 4 }],
        meds: [],
      };
    case "pac_pedro":
      return {
        moodDays: series(today, [3, 3, 2, 2, 3, 3, 3, 4, 3, 3, 4, 4, 3, 4]),
        activities: [
          {
            id: "p-sono",
            kind: "sleep",
            date: addDays(today, -4),
            answers: { n1: 5, n2: 6, n3: 5.5, n4: 7, n5: 6, n6: 6.5, n7: 5 },
          },
        ],
        symptoms: [
          { nome: "Sonolência", vezes: 9, media: 2.6, maxima: 4 },
          { nome: "Boca seca", vezes: 5, media: 2, maxima: 3 },
          { nome: "Náusea", vezes: 2, media: 2, maxima: 2 },
        ],
        meds: [
          { nome: "Escitalopram", dosagem: "10 mg", horarios: "08:00", taken: 6, planned: 7 },
          { nome: "Clonazepam", dosagem: "0,5 mg", horarios: "22:00", taken: 7, planned: 7 },
        ],
      };
    case "pac_lucia":
      // Compartilha só o humor: o resto o profissional não vê.
      return { moodDays: series(today, [3, 4, 3, 3, 4, 4, 5, 4, 4, 3, 4, 4, 4, 5]) };
    default:
      return null;
  }
}

/** Sessões de exemplo da semana, em torno de hoje. */
export function demoSessions(today: string): ProSession[] {
  return [
    { id: "s1", patientId: "pac_marina", data: today, hora: "09:00", tipo: "online", status: "confirmado" },
    {
      id: "s2",
      patientId: "pac_pedro",
      data: today,
      hora: "14:00",
      tipo: "presencial",
      status: "confirmado",
    },
    { id: "s3", patientId: "pac_lucia", data: today, hora: "16:30", tipo: "online", status: "pendente" },
    {
      id: "s4",
      patientId: "pac_marina",
      data: addDays(today, 1),
      hora: "09:00",
      tipo: "online",
      status: "confirmado",
    },
    {
      id: "s5",
      patientId: "pac_pedro",
      data: addDays(today, 3),
      hora: "10:00",
      tipo: "presencial",
      status: "confirmado",
    },
    {
      id: "s6",
      patientId: "pac_lucia",
      data: addDays(today, -3),
      hora: "16:30",
      tipo: "online",
      status: "realizada",
    },
    {
      id: "s7",
      patientId: "pac_marina",
      data: addDays(today, -7),
      hora: "09:00",
      tipo: "online",
      status: "realizada",
    },
    {
      id: "s8",
      patientId: "pac_pedro",
      data: addDays(today, -10),
      hora: "10:00",
      tipo: "presencial",
      status: "realizada",
    },
  ];
}

/** Receitas de exemplo, no estado em que estariam hoje. */
export function demoPrescriptions(today: string): Prescription[] {
  const rx = (
    id: string,
    patientId: string,
    nome: string,
    dosagem: string,
    kind: Prescription["kind"],
    consultaHa: number,
    usoDe: number,
    usoAte: number,
    status: Prescription["status"] = "issued",
    extra: Partial<Prescription> = {},
  ): Prescription => ({
    id,
    patientId,
    nome,
    dosagem,
    kind,
    consultationDate: addDays(today, consultaHa),
    useFrom: addDays(today, usoDe),
    useUntil: addDays(today, usoAte),
    status,
    change: "none",
    ...extra,
  });
  return [
    rx("rec_1", LIVE_PATIENT_ID, "Sertralina", "50 mg, 1 comprimido pela manhã", "common", -28, -28, 2),
    rx("rec_2", LIVE_PATIENT_ID, "Clonazepam", "0,5 mg, à noite se necessário", "B", -9, -9, 51),
    rx(
      "rec_3",
      LIVE_PATIENT_ID,
      "Metilfenidato",
      "10 mg, 1 comprimido ao acordar",
      "A",
      -35,
      -35,
      -5,
      "used",
    ),
    rx("rec_4", "pac_marina", "Escitalopram", "10 mg, 1 comprimido pela manhã", "common", -20, -20, 40),
    rx("rec_5", "pac_pedro", "Amitriptilina", "25 mg, 1 comprimido à noite", "C1", -34, -34, -2),
    rx(
      "rec_6",
      "pac_lucia",
      "Sertralina",
      "50 mg, 1 comprimido pela manhã",
      "common",
      -60,
      -60,
      -30,
      "stopped",
      {
        change: "stop",
        changeNote: "Suspensa para troca de medicação.",
      },
    ),
  ];
}

/** Pedidos de nova receita que os pacientes já fizeram. */
export function demoRequests(today: string): PrescriptionRequest[] {
  return [
    {
      id: "ped_1",
      patientId: LIVE_PATIENT_ID,
      nome: "Sertralina",
      requestedAt: addDays(today, -1),
      note: "Acaba em 2 dias.",
    },
    { id: "ped_2", patientId: "pac_pedro", nome: "Amitriptilina", requestedAt: today },
  ];
}

/** Exames de exemplo, um em cada etapa. */
export function demoExams(today: string): ExamRequest[] {
  return [
    {
      id: "exa_1",
      patientId: LIVE_PATIENT_ID,
      nome: "Hemograma",
      requestedAt: addDays(today, -9),
      step: 3,
      result: "Valores dentro da referência (exemplo).",
    },
    { id: "exa_2", patientId: LIVE_PATIENT_ID, nome: "TSH", requestedAt: addDays(today, -4), step: 2 },
    { id: "exa_3", patientId: "pac_pedro", nome: "Glicemia", requestedAt: addDays(today, -1), step: 1 },
  ];
}
