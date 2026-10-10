"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePlanner } from "../hooks/usePlanner";
import { nextUp } from "../logic";

/** "Agora": a próxima coisa do Meu dia, com um botão para dizer que já fez. */
export function NowCard() {
  const { tasks, today, toggleDone } = usePlanner();
  const now = new Date().toTimeString().slice(0, 5);
  const next = nextUp(tasks, today, now);

  return (
    <section aria-label="Agora" className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-xs font-medium tracking-widest text-brand-accent uppercase">Agora</h2>
      {next ? (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-foreground">{next.title}</p>
            {next.time && <p className="text-sm text-muted-foreground">às {next.time}</p>}
          </div>
          {next.readonly ? (
            next.href && (
              <Link href={next.href} className="text-sm font-semibold text-brand-ink underline">
                Abrir
              </Link>
            )
          ) : (
            <Button className="min-h-11" onClick={() => toggleDone(next.id)}>
              <Check aria-hidden />
              Feito
            </Button>
          )}
        </div>
      ) : (
        <p className="text-base text-foreground">Nada pendente agora. Respire e aproveite.</p>
      )}
      <Link href="/dashboard/planner" className="text-sm font-semibold text-brand-ink hover:underline">
        Ver meu dia
      </Link>
    </section>
  );
}
