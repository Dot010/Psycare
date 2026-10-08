import { useLocalStorage } from "@/lib/useLocalStorage";

export const PREFS_KEY = "psycare:prefs:v1";

export interface Prefs {
  /** Lembrete diário para o check-in ligado ou não. */
  reminderOn: boolean;
  /** Horário do lembrete (HH:MM). */
  reminderTime: string;
}

export const DEFAULT_PREFS: Prefs = { reminderOn: false, reminderTime: "20:00" };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function usePrefs() {
  const [prefs, setPrefs] = useLocalStorage<Prefs>(PREFS_KEY, DEFAULT_PREFS);
  const update = (patch: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      return isValidTime(next.reminderTime) ? next : { ...next, reminderTime: current.reminderTime };
    });
  };
  return { prefs, update };
}
