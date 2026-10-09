"use client";

import { DEMO_STOCK } from "@/features/pro/data";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type { Stock } from "../stock";

export const STOCK_KEY = "psycare:stock:v1";
const NO_STOCK: Record<string, Stock> = {};

const keyOf = (nome: string) => nome.trim().toLowerCase();

/** Estoque de cada remédio. É só da pessoa: o profissional não vê. */
export function useStock() {
  const [stored, setStored] = useLocalStorage<Record<string, Stock>>(STOCK_KEY, NO_STOCK);

  const stockOf = (nome: string): Stock | undefined => stored[keyOf(nome)] ?? DEMO_STOCK[keyOf(nome)];

  /** Define quantas unidades a pessoa tem hoje. */
  const setCount = (nome: string, count: number) =>
    setStored((current) => ({
      ...current,
      [keyOf(nome)]: { count: Math.max(0, Math.round(count)), since: toISODate(new Date()) },
    }));

  return { stockOf, setCount };
}
