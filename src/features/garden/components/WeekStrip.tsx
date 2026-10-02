import { Droplets } from "lucide-react";
import { fromISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface WeekStripProps {
  days: { date: string; count: number }[];
  streak: number;
}

/** Os últimos 7 dias: preenchido quando houve ao menos uma ação de cuidado. */
export function WeekStrip({ days, streak }: WeekStripProps) {
  const cared = days.filter((day) => day.count > 0).length;

  return (
    <section aria-labelledby="week-title" className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="week-title" className="text-base font-bold text-foreground">
          Sua semana
        </h2>
        <p className="text-xs text-muted-foreground">
          {cared === 0
            ? "Comece quando quiser"
            : `${cared} ${cared === 1 ? "dia" : "dias"} de cuidado${streak > 1 ? ` · ${streak} seguidos` : ""}`}
        </p>
      </div>
      <ol className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const label = fromISODate(day.date)
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", "");
          return (
            <li key={day.date} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  day.count > 0 ? "bg-brand-600 text-white" : "bg-sunken text-muted-foreground",
                )}
              >
                <Droplets className="size-4" aria-hidden />
                <span className="sr-only">
                  {day.count > 0 ? `${day.count} ações de cuidado` : "nenhuma ação"}, {label}
                </span>
              </span>
              <span aria-hidden className="text-xs text-muted-foreground capitalize">
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
