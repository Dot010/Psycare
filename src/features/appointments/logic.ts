import type { Agendamento } from "@/features/appointments/types";

/** AAAA-MM-DDTHH:mm: dá para comparar como texto. */
function stamp(item: Agendamento): string {
  return `${item.data}T${item.hora}`;
}

export function sortByDateTime(list: Agendamento[]): Agendamento[] {
  return [...list].sort((a, b) => (stamp(a) < stamp(b) ? -1 : stamp(a) > stamp(b) ? 1 : 0));
}

/** `now` no formato AAAA-MM-DDTHH:mm (hora local). */
export function splitAppointments(list: Agendamento[], now: string) {
  const sorted = sortByDateTime(list);
  const upcoming = sorted.filter((item) => item.status !== "cancelado" && stamp(item) >= now);
  const past = sorted.filter((item) => !upcoming.includes(item)).reverse();
  return { upcoming, past };
}

export function nextAppointment(list: Agendamento[], now: string): Agendamento | undefined {
  return splitAppointments(list, now).upcoming[0];
}

const MINUTE = 60_000;
const DAY = 86_400_000;

function toDate(item: Pick<Agendamento, "data" | "hora">): Date {
  const [y, m, d] = item.data.split("-").map(Number);
  const [hh, mm] = item.hora.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

/**
 * Confere se o horário pode ser usado: não pode estar no passado nem coincidir com outra
 * consulta não cancelada. Devolve a mensagem de erro ou `null` se estiver tudo certo.
 */
export function validateSlot(
  slot: Pick<Agendamento, "data" | "hora">,
  list: Agendamento[],
  now: string,
  ignoreId?: string,
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.data) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.hora)) {
    return "Escolha uma data e um horário válidos.";
  }
  if (`${slot.data}T${slot.hora}` < now) return "Essa data e horário já passaram. Escolha um horário futuro.";
  const clash = list.find(
    (item) =>
      item.id !== ignoreId &&
      item.status !== "cancelado" &&
      item.data === slot.data &&
      item.hora === slot.hora,
  );
  if (clash) return `Você já tem uma sessão com ${clash.profissional} nesse horário.`;
  return null;
}

/** Frase curta de contagem regressiva para a próxima sessão. */
export function countdown(item: Pick<Agendamento, "data" | "hora">, nowDate: Date): string {
  const diff = toDate(item).getTime() - nowDate.getTime();
  if (diff <= 0) return "Agora";
  const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
  const startOfDay = new Date(
    toDate(item).getFullYear(),
    toDate(item).getMonth(),
    toDate(item).getDate(),
  ).getTime();
  const days = Math.round((startOfDay - startOfToday) / DAY);
  if (days === 0) {
    const minutes = Math.round(diff / MINUTE);
    if (minutes < 60) return `Daqui a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Hoje, daqui a ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function icsLocal(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}T${p(date.getHours())}${p(date.getMinutes())}00`;
}

function icsUtc(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
}

/** Arquivo de calendário (.ics) com as consultas informadas, de 1 hora cada. */
export function buildIcs(items: Agendamento[], now: Date = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PsyCare//Agenda//PT-BR", "CALSCALE:GREGORIAN"];
  for (const item of items) {
    const start = toDate(item);
    const end = new Date(start.getTime() + 60 * MINUTE);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.id}@psycare`,
      `DTSTAMP:${icsUtc(now)}`,
      `DTSTART:${icsLocal(start)}`,
      `DTEND:${icsLocal(end)}`,
      `SUMMARY:${icsEscape(`Sessão com ${item.profissional}`)}`,
      `DESCRIPTION:${icsEscape(`${item.tipo === "online" ? "Online" : "Presencial"}${item.observacao ? `. ${item.observacao}` : ""}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
