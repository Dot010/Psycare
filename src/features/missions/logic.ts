import type { WaterSource } from "@/features/garden/types";

export const MISSIONS_KEY = "psycare:missions:v1";
export const MISSIONS_PER_DAY = 3;

export interface Mission {
  id: string;
  text: string;
  /** Se vem de uma ação do app, é cumprida sozinha quando a ação acontece. */
  auto?: WaterSource;
  href?: string;
}

export const MISSION_POOL: readonly Mission[] = [
  { id: "checkin", text: "Contar como você está", auto: "checkin" },
  { id: "diario", text: "Escrever uma linha no diário", auto: "diary", href: "/dashboard/diary" },
  { id: "respirar", text: "Respirar por um minuto", auto: "breathing", href: "/dashboard/breathing" },
  { id: "habito", text: "Concluir um hábito", auto: "habit", href: "/dashboard/habits" },
  { id: "agua", text: "Beber um copo de água" },
  { id: "caminhar", text: "Dar uma volta de cinco minutos" },
  { id: "pessoa", text: "Mandar uma mensagem para alguém de quem gosta" },
  { id: "alongar", text: "Alongar o corpo por um instante" },
];

export interface MissionState {
  /** Dia a que o estado se refere (AAAA-MM-DD). Muda o dia, recomeça. */
  date: string;
  /** Ids das missões manuais marcadas hoje. */
  done: string[];
}

export const NO_MISSIONS: MissionState = { date: "", done: [] };

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/** As três missões do dia: sempre as mesmas para o mesmo dia, variando de um dia para o outro. */
export function missionsForDay(date: string): Mission[] {
  const n = MISSION_POOL.length;
  const start = hash(date) % n;
  // Passo 3 é coprimo com 8, então os três índices nunca se repetem.
  return Array.from({ length: MISSIONS_PER_DAY }, (_, k) => MISSION_POOL[(start + k * 3) % n]);
}

export function isMissionDone(
  mission: Mission,
  state: MissionState,
  date: string,
  doneToday: Set<WaterSource>,
): boolean {
  if (mission.auto) return doneToday.has(mission.auto);
  return state.date === date && state.done.includes(mission.id);
}

export function toggleManual(state: MissionState, id: string, date: string): MissionState {
  const base = state.date === date ? state.done : [];
  return { date, done: base.includes(id) ? base.filter((x) => x !== id) : [...base, id] };
}

export function missionSentence(done: number, total: number): string {
  if (done === 0) return "Três pequenos gestos para hoje. Faça os que couberem.";
  if (done >= total) return "Tudo feito por hoje. O jardim agradece.";
  return `${done} de ${total}. Cada um já conta.`;
}
