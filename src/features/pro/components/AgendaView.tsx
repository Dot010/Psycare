"use client";

import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { fromISODate } from "@/lib/dates";
import { addDays } from "@/features/health/logic";
import { groupByDay } from "../logic";
import { usePro } from "../hooks/usePro";
import { SessionLine } from "./SessionLine";

function dayTitle(iso: string, today: string): string {
  if (iso === today) return "Hoje";
  if (iso === addDays(today, 1)) return "Amanhã";
  const text = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
    fromISODate(iso),
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function AgendaView() {
  const pro = usePro();
  const upcoming = groupByDay(pro.sessions.filter((s) => s.data >= pro.today && s.status !== "cancelado"));
  const past = groupByDay(pro.sessions.filter((s) => s.data < pro.today)).reverse();

  return (
    <Page title="Agenda" description="Suas próximas sessões." width="narrow" className="space-y-10">
      {upcoming.length === 0 && <p className="text-base text-muted-foreground">Nenhuma sessão marcada.</p>}
      {upcoming.map((group) => (
        <section key={group.date} aria-label={dayTitle(group.date, pro.today)} className="space-y-1">
          <h2 className="text-2xl font-semibold text-brand-ink">{dayTitle(group.date, pro.today)}</h2>
          <ul>
            {group.items.map((s) => (
              <SessionLine
                key={s.id}
                session={s}
                actions={
                  <>
                    {s.status === "pendente" && (
                      <Button size="sm" onClick={() => pro.setSessionStatus(s.id, "confirmado")}>
                        Confirmar
                      </Button>
                    )}
                    {s.status === "confirmado" && s.data === pro.today && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pro.setSessionStatus(s.id, "realizada")}
                      >
                        Marcar como realizada
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => pro.setSessionStatus(s.id, "cancelado")}>
                      Cancelar
                    </Button>
                  </>
                }
              />
            ))}
          </ul>
        </section>
      ))}

      {past.length > 0 && (
        <section aria-labelledby="past-title" className="space-y-1 border-t border-border pt-8">
          <h2 id="past-title" className="text-2xl font-semibold text-brand-ink">
            Anteriores
          </h2>
          {past.map((group) => (
            <div key={group.date}>
              <h3 className="mt-3 text-sm text-muted-foreground">{dayTitle(group.date, pro.today)}</h3>
              <ul>
                {group.items.map((s) => (
                  <SessionLine key={s.id} session={s} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </Page>
  );
}
