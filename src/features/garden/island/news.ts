import { pendingAssignments } from "@/features/activities/logic";
import type { Assignment } from "@/features/activities/types";
import { nextAppointment } from "@/features/appointments/logic";
import type { Agendamento } from "@/features/appointments/types";
import type { Chat } from "@/features/messages/types";
import type { PlaceId } from "@/features/garden/island/places";
import { formatDateBR } from "@/lib/format";

export interface NewsInput {
  assignments: Assignment[];
  chats: Chat[];
  appointments: Agendamento[];
  diaryPages: number;
  /** Agora, como "AAAA-MM-DDTHH:MM". */
  now: string;
}

const short = (text: string, max = 70) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/**
 * O que cada lugar da ilha tem de novo, tirado das telas de verdade do app:
 * a ilha mostra o mesmo que o resto do app, e não uma cópia.
 */
export function placeNews(place: PlaceId, input: NewsInput): string | null {
  if (place === "garrafa") {
    const pending = pendingAssignments(input.assignments).length;
    return pending === 0
      ? "Nenhuma atividade pedida agora."
      : `${pending} ${pending === 1 ? "atividade esperando" : "atividades esperando"} você.`;
  }
  if (place === "correio") {
    let last: { from: string; text: string } | null = null;
    for (const chat of input.chats) {
      const message = [...chat.messages].reverse().find((m) => m.sender === "doctor");
      if (message) last = { from: chat.doctorName, text: message.content };
    }
    return last ? `Última de ${last.from}: “${short(last.text)}”` : null;
  }
  if (place === "consulta") {
    const next = nextAppointment(input.appointments, input.now);
    if (!next) return "Nenhuma consulta marcada.";
    const waiting = next.status === "pendente" ? " (esperando confirmação)" : "";
    return `Próxima: ${next.profissional}, ${formatDateBR(next.data)} às ${next.hora}${waiting}.`;
  }
  if (place === "cabana") {
    const n = input.diaryPages;
    return n === 0 ? "A estante ainda está vazia." : `${n} ${n === 1 ? "página" : "páginas"} na estante.`;
  }
  return null;
}
