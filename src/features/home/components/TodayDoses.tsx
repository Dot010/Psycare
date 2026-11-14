"use client";

import Link from "next/link";
import { useHealth } from "@/features/health/hooks/useHealth";
import { dosesForDay } from "@/features/health/logic";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Os remédios de hoje no Início, em linhas curtas. Some quando não há remédio cadastrado. */
export function TodayDoses() {
  const { remedios, taken, toggleDose } = useHealth();
  const today = toISODate(new Date());
  const doses = dosesForDay(remedios, today);
  if (doses.length === 0) return null;

  return (
    <section aria-labelledby="doses-title" className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 id="doses-title" className="text-base font-medium text-ink">
          Remédios de hoje
        </h2>
        <Link href="/dashboard/health" className="text-sm text-brand-ink underline-offset-4 hover:underline">
          Ver tudo
        </Link>
      </div>
      <ol aria-label="Doses de hoje">
        {doses.map((dose) => {
          const done = taken.includes(dose.key);
          return (
            <li key={dose.key} className="flex min-h-14 items-center gap-4 text-sm">
              <span className="w-11 shrink-0 text-muted-foreground tabular-nums">{dose.time}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-foreground">{dose.nome}</span>
                {dose.dosagem && <span className="block text-xs text-muted-foreground">{dose.dosagem}</span>}
              </span>
              <button
                type="button"
                aria-pressed={done}
                aria-label={`${done ? "Desmarcar" : "Marcar como tomado:"} ${dose.nome}, ${dose.time}`}
                onClick={() => toggleDose(dose.key, today)}
                className={cn(
                  "min-h-9 shrink-0 rounded-full px-3.5 text-xs font-semibold pointer-coarse:min-h-11 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                  done
                    ? "bg-brand-100 text-brand-ink"
                    : "border-[1.5px] border-brand-600 text-brand-ink hover:bg-brand-50",
                )}
              >
                {done ? "tomado" : "Marcar"}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">O app só lembra. Doses, sempre com o seu médico.</p>
    </section>
  );
}
