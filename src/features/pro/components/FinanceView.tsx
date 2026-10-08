"use client";

import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { formatCurrencyBRL } from "@/lib/format";
import { financeSummary } from "../logic";
import { usePro } from "../hooks/usePro";

export default function FinanceView() {
  const pro = usePro();
  const summary = financeSummary(pro.sessions, pro.patients, pro.today);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date());

  return (
    <Page title="Financeiro" description={`Resumo de ${month}.`} width="narrow" className="space-y-10">
      <DemoNotice>Valores de exemplo. O PsyCare não recebe nem repassa pagamentos de verdade.</DemoNotice>
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Recebido</dt>
          <dd className="text-3xl font-semibold text-brand-ink">{formatCurrencyBRL(summary.received)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">A receber</dt>
          <dd className="text-3xl font-semibold text-foreground">{formatCurrencyBRL(summary.toReceive)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Sessões realizadas</dt>
          <dd className="text-3xl font-semibold text-foreground">{summary.count}</dd>
        </div>
      </dl>

      <section aria-labelledby="by-patient" className="space-y-2">
        <h2 id="by-patient" className="text-2xl font-semibold text-brand-ink">
          Por paciente
        </h2>
        {summary.byPatient.length === 0 ? (
          <p className="text-base text-muted-foreground">Nenhuma sessão realizada neste mês.</p>
        ) : (
          <table className="w-full text-base">
            <caption className="sr-only">Sessões e valores por paciente</caption>
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th scope="col" className="pb-1 text-left font-normal">
                  Paciente
                </th>
                <th scope="col" className="pb-1 text-right font-normal">
                  Sessões
                </th>
                <th scope="col" className="pb-1 text-right font-normal">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.byPatient.map((row) => (
                <tr key={row.patient.id} className="border-t border-border">
                  <th scope="row" className="py-3 text-left font-medium">
                    {row.patient.name}
                  </th>
                  <td className="text-right">{row.sessions}</td>
                  <td className="text-right font-semibold">{formatCurrencyBRL(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Page>
  );
}
