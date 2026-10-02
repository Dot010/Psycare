import type { ReactNode } from "react";
import { mockUser } from "@/mocks/user";

interface NextSessionCardProps {
  /** Botão ou link opcional exibido abaixo dos dados. */
  action?: ReactNode;
}

export function NextSessionCard({ action }: NextSessionCardProps) {
  const { doctor, date, time } = mockUser.nextSession;

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-primary">Próxima sessão</h2>
      <dl className="mt-3 space-y-1 text-foreground/90">
        <div className="flex gap-1.5">
          <dt className="font-semibold">Profissional:</dt>
          <dd>{doctor}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="font-semibold">Quando:</dt>
          <dd>
            {date} às {time}
          </dd>
        </div>
      </dl>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
