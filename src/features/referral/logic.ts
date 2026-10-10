import type { Task } from "@/features/planner/types";
import type { Referral, ReferralStage } from "./types";

export const STAGES: ReferralStage[] = ["requested", "issued", "authorized", "delivered"];

export const STAGE_LABEL: Record<ReferralStage, string> = {
  requested: "Pedido enviado",
  issued: "Emitido pelo psiquiatra",
  authorized: "Autorizado pelo convênio",
  delivered: "Entregue à psicóloga",
};

export function stageOf(r: Pick<Referral, "issuedAt" | "authorizedAt" | "deliveredAt">): ReferralStage {
  if (r.deliveredAt) return "delivered";
  if (r.authorizedAt) return "authorized";
  if (r.issuedAt) return "issued";
  return "requested";
}

/** Em andamento: pedido feito e ainda não entregue, nem cancelado. */
export const isOpen = (r: Referral): boolean => !r.canceled && stageOf(r) !== "delivered";

/** O encaminhamento mais recente do paciente que não foi cancelado. */
export function currentFor(list: Referral[], patientId: string): Referral | undefined {
  return list
    .filter((r) => r.patientId === patientId && !r.canceled)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt) || b.id.localeCompare(a.id))[0];
}

/** Só dá para pedir um novo quando não há um em andamento. */
export const canRequest = (list: Referral[], patientId: string): boolean => {
  const current = currentFor(list, patientId);
  return !current || stageOf(current) === "delivered";
};

export const SESSIONS_MAX = 60;

/** Limpa a autorização digitada: convênio com 2 a 60 letras e sessões de 1 a 60. */
export function parseAuthorization(
  insurance: string,
  sessions: string,
): { insurance: string; sessions: number } | null {
  const name = insurance.replace(/\s+/g, " ").trim().slice(0, 60);
  const n = Number(sessions);
  if (name.length < 2 || !Number.isInteger(n) || n < 1 || n > SESSIONS_MAX) return null;
  return { insurance: name, sessions: n };
}

export const REMINDER_OPTIONS = [
  "Oi! Quando puder, leve o encaminhamento ao convênio. Sem pressa, estou por aqui.",
  "Oi! Já pode me entregar o encaminhamento quando for conveniente. Qualquer dúvida, me diga.",
] as const;

/** Tarefas do Meu dia que nascem do encaminhamento. Concluem-se no card de Saúde. */
export function referralTasks(list: Referral[], patientId: string, today: string): Task[] {
  const current = currentFor(list, patientId);
  if (!current) return [];
  const stage = stageOf(current);
  const base = {
    date: today,
    importance: "medium" as const,
    done: false,
    source: "encaminhamento" as const,
    href: "/dashboard/health#encaminhamento",
    readonly: true,
  };
  if (stage === "issued") {
    return [{ ...base, id: `enc:${current.id}:convenio`, title: "Levar o encaminhamento ao convênio" }];
  }
  if (stage === "authorized") {
    return [{ ...base, id: `enc:${current.id}:psicologa`, title: "Levar o encaminhamento à psicóloga" }];
  }
  return [];
}
