/**
 * Estoque do remédio: quantas unidades (comprimidos ou cápsulas) a pessoa ainda tem.
 * É uma estimativa: parte do que ela contou ou comprou e desconta as doses marcadas como tomadas.
 */
export interface Stock {
  /** Quantas unidades havia em `since`. */
  count: number;
  /** AAAA-MM-DD. Doses a partir deste dia já saíram do estoque. */
  since: string;
}

/** Faltando este número de dias ou menos, o app avisa que o remédio está acabando. */
export const STOCK_WARN_DAYS = 10;

/** Quantas doses deste remédio foram marcadas como tomadas a partir de `since`. */
export function dosesTakenSince(taken: string[], medId: string, since: string): number {
  return taken.filter((key) => {
    const [id, date] = key.split("|");
    return id === medId && date >= since;
  }).length;
}

export function remainingUnits(stock: Stock, taken: string[], medId: string, unitsPerDose = 1): number {
  return Math.max(0, stock.count - dosesTakenSince(taken, medId, stock.since) * unitsPerDose);
}

/** Para quantos dias o que sobrou dá. Sem horário cadastrado, conta 1 dose por dia. */
export function daysOfSupply(remaining: number, dosesPerDay: number, unitsPerDose = 1): number {
  const perDay = Math.max(1, dosesPerDay) * unitsPerDose;
  return Math.floor(remaining / perDay);
}

export function isRunningLow(days: number): boolean {
  return days <= STOCK_WARN_DAYS;
}
