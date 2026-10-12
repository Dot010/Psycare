"use client";

import Link from "next/link";
import { useReferrals } from "@/features/referral/hooks/useReferrals";
import { isOpen, stageOf } from "@/features/referral/logic";
import { patientById } from "../data";
import { useExams } from "../hooks/useExams";
import { usePrescriptions } from "../hooks/usePrescriptions";

export interface InboxItem {
  id: string;
  kind: string;
  who: string;
  what: string;
  href: string;
}

/** Os pedidos que esperam o psiquiatra, de qualquer tipo, numa lista só. */
export function ClinicalInbox() {
  const { pendingRequests } = usePrescriptions();
  const { referrals } = useReferrals();
  const { exams } = useExams();
  const name = (id: string) => patientById(id)?.name ?? "Paciente";

  const items: InboxItem[] = [
    ...pendingRequests.map((r) => ({
      id: `rx-${r.id}`,
      kind: "Receita",
      who: name(r.patientId),
      what: `pediu nova receita de ${r.nome}`,
      href: "/dashboard/pro/clinical?aba=receitas",
    })),
    ...referrals
      .filter((r) => isOpen(r) && stageOf(r) === "requested")
      .map((r) => ({
        id: `enc-${r.id}`,
        kind: "Encaminhamento",
        who: name(r.patientId),
        what: "pediu encaminhamento para a psicóloga",
        href: "/dashboard/pro/clinical?aba=encaminhamentos",
      })),
    ...exams
      .filter((e) => e.step === 3)
      .map((e) => ({
        id: `exa-${e.id}`,
        kind: "Exame",
        who: name(e.patientId),
        what: `${e.nome}: resultado para ler`,
        href: "/dashboard/pro/clinical?aba=exames",
      })),
  ];

  return (
    <section aria-labelledby="inbox-title" className="space-y-2 border-t border-border pt-8">
      <h2 id="inbox-title" className="text-2xl font-semibold text-brand-ink">
        {items.length === 0
          ? "Nenhum pedido esperando"
          : `${items.length} ${items.length === 1 ? "pedido espera" : "pedidos esperam"} você`}
      </h2>
      {items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3"
            >
              <div>
                <p className="text-lg font-medium text-foreground">{item.who}</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{item.kind}</span> · {item.what}
                </p>
              </div>
              <Link
                href={item.href}
                className="text-sm font-semibold text-brand-ink underline-offset-2 hover:underline"
              >
                Responder
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
