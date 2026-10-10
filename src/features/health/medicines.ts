import type { Prescription } from "@/features/pro/types";
import { latestPerMedicine } from "@/features/pro/prescriptionRules";
import type { Medicamento } from "./types";

/** Horários prováveis a partir do "como usar" que o psiquiatra escreveu. A pessoa pode ajustar o lembrete. */
export function timesFromText(text: string): string[] {
  const t = text.toLowerCase();
  if (/3\s*(vezes|x)|de 8 em 8/.test(t)) return ["08:00", "14:00", "20:00"];
  if (/2\s*(vezes|x)|de 12 em 12/.test(t)) return ["08:00", "20:00"];
  if (/antes de dormir|ao deitar/.test(t)) return ["22:00"];
  if (/ao acordar/.test(t)) return ["07:00"];
  if (/manh[ãa]/.test(t)) return ["08:00"];
  if (/tarde/.test(t)) return ["14:00"];
  if (/noite/.test(t)) return ["20:00"];
  return [];
}

const keyOf = (nome: string) => nome.trim().toLowerCase();
const slug = (nome: string) =>
  keyOf(nome)
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-");

/**
 * A lista de remédios da pessoa. Quem escolhe os remédios é o psiquiatra: cada remédio com receita ativa
 * entra na lista (com os horários que já existem, se houver), e o suspenso sai.
 */
export function medicinesFor(
  saved: Medicamento[],
  prescriptions: Prescription[],
  patientId: string,
): Medicamento[] {
  const latest = latestPerMedicine(prescriptions.filter((p) => p.patientId === patientId));
  const stopped = new Set(latest.filter((p) => p.status === "stopped").map((p) => keyOf(p.nome)));
  const known = new Set(saved.map((m) => keyOf(m.nome)));

  const kept = saved.filter((m) => !stopped.has(keyOf(m.nome)));
  const added = latest
    .filter((p) => p.status !== "stopped" && !known.has(keyOf(p.nome)))
    .map((p): Medicamento => ({
      id: `rx-${slug(p.nome)}`,
      nome: p.nome,
      dosagem: p.dosagem.split(",")[0].trim(),
      frequencia: "",
      horario: "",
      horarios: timesFromText(p.dosagem),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  return [...kept, ...added];
}
