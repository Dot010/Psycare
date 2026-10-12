/** Regras pequenas de validação que várias áreas usam (datas, horas e aviso de limite). */

/** AAAA-MM-DD que existe de verdade no calendário (recusa 2026-02-31, por exemplo). */
export function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** HH:MM de 00:00 a 23:59. */
export function isClockTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export const tooLong = (max: number) => `Use até ${max} caracteres`;
