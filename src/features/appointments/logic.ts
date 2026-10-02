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
