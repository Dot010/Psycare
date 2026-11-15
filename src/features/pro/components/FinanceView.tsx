"use client";

import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { CountUp } from "@/components/motion/CountUp";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fieldControlClass } from "@/components/ui/input";
import { UnderlineTabs } from "@/components/ui/underline-tabs";
import { formatCurrencyBRL, formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { patientById } from "../data";
import {
  buildLedger,
  debtors,
  demoFinanceHistory,
  monthlyTotals,
  monthTotals,
  weeklyBars,
  type Charge,
} from "../finance";
import { FEE_MAX, usePro } from "../hooks/usePro";
import { useProIdentity } from "./ProIdentity";

type Filter = "todas" | "pendentes" | "pagas";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "pendentes", label: "Pendentes" },
  { id: "pagas", label: "Pagas" },
];

const nameOf = (id: string) => patientById(id)?.name ?? "Paciente";

/**
 * O financeiro do consultório, no jeito de um ERP pequeno: o mês em números, as semanas e os
 * últimos 6 meses em gráficos, quem está devendo, o valor da sessão e cada lançamento com recibo.
 */
export default function FinanceView() {
  const pro = usePro();
  const me = useProIdentity();
  const month = pro.today.slice(0, 7);
  const [filter, setFilter] = useState<Filter>("todas");
  const [receipt, setReceipt] = useState<Charge | null>(null);

  const history = useMemo(() => demoFinanceHistory(pro.patients, pro.today), [pro.patients, pro.today]);
  const ledger = buildLedger(pro.sessions, pro.closings, pro.patients, pro.today, history);
  const totals = monthTotals(ledger, pro.closings, month);
  const weeks = weeklyBars(ledger, month);
  const months = monthlyTotals(ledger, pro.today);
  const owing = debtors(ledger);
  const previous = months.at(-2)?.total ?? 0;
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date());
  const visible = ledger.filter((c) => (filter === "todas" ? true : filter === "pagas" ? c.paid : !c.paid));
  const canMarkPaid = (c: Charge) =>
    !c.paid && !!c.sessionId && pro.closings.some((x) => x.sessionId === c.sessionId);

  return (
    <Page
      title="Financeiro"
      kicker={monthName}
      description="O consultório em números. Valores de exemplo."
      width="wide"
    >
      <DemoNotice>Valores de exemplo. O PsyCare não recebe nem repassa pagamentos de verdade.</DemoNotice>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Recebido no mês" tone="brand">
          {formatCurrencyBRL(totals.received)}
          {months.length > 1 && (
            <span className="mt-1 block text-xs font-normal">
              Mês passado: {formatCurrencyBRL(previous)}. O mês ainda não acabou.
            </span>
          )}
        </Stat>
        <Stat label="A receber" tone="sun">
          {formatCurrencyBRL(totals.pending)}
        </Stat>
        <Stat label="Sessões cobradas">
          <CountUp value={totals.charged} />
        </Stat>
        <Stat label="Faltas no mês">
          {totals.missRate === null ? (
            <span className="text-base font-normal text-muted-foreground">sem sessões encerradas</span>
          ) : (
            <>
              <CountUp value={totals.missRate} />%
            </>
          )}
        </Stat>
      </dl>

      <PageColumns
        aside={
          <>
            <Block title="Quem está devendo">
              {owing.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma cobrança pendente.</p>
              ) : (
                <ul>
                  {owing.map((d) => (
                    <li
                      key={d.patientId}
                      className="flex items-baseline justify-between gap-3 border-t border-sunken py-2.5 first:border-t-0"
                    >
                      <span className="text-sm">
                        {nameOf(d.patientId)}
                        <span className="block text-xs text-muted-foreground">
                          {d.count} {d.count === 1 ? "sessão" : "sessões"}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-sun-700">{formatCurrencyBRL(d.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {owing.length > 0 && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFilter("pendentes")}>
                  Ver as pendentes
                </Button>
              )}
            </Block>

            <Block title="Valor da sessão">
              <p className="-mt-2 mb-3 text-xs text-muted-foreground">
                Vale para as próximas cobranças. As que já foram lançadas guardam o valor da época.
              </p>
              <ul className="space-y-3">
                {pro.patients.map((p) => (
                  <FeeRow
                    key={`${p.id}-${p.fee}`}
                    name={p.name}
                    fee={p.fee}
                    onSave={(v) => pro.setFee(p.id, v)}
                  />
                ))}
              </ul>
            </Block>
          </>
        }
      >
        <Block title={`Semanas de ${monthName.split(" ")[0]}`} size="lg">
          <WeekChart weeks={weeks} />
        </Block>

        <Block title="Últimos 6 meses" size="lg" aside="recebido por mês">
          <MonthChart months={months} />
        </Block>

        <Block title="Lançamentos" size="lg">
          <UnderlineTabs
            label="Filtrar lançamentos"
            tabs={FILTERS}
            value={filter}
            onChange={setFilter}
            className="mb-3"
          />
          {visible.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nada por aqui.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <caption className="sr-only">Cobranças, da mais nova para a mais antiga</caption>
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th scope="col" className="py-2 font-normal">
                      Data
                    </th>
                    <th scope="col" className="py-2 font-normal">
                      Paciente
                    </th>
                    <th scope="col" className="py-2 text-right font-normal">
                      Valor
                    </th>
                    <th scope="col" className="py-2 pl-4 font-normal">
                      Situação
                    </th>
                    <th scope="col" className="py-2">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.slice(0, 40).map((c) => (
                    <tr key={c.id} className="border-t border-sunken">
                      <td className="py-2.5 tabular-nums">{formatDateBR(c.date)}</td>
                      <th scope="row" className="py-2.5 text-left font-normal">
                        {nameOf(c.patientId)}
                        {c.missed && <span className="ml-2 text-xs text-muted-foreground">falta</span>}
                      </th>
                      <td className="py-2.5 text-right font-medium tabular-nums">
                        {formatCurrencyBRL(c.amount)}
                      </td>
                      <td className="py-2.5 pl-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            c.paid ? "bg-brand-100 text-brand-ink" : "bg-sun-100 text-sun-700",
                          )}
                        >
                          {c.paid ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        {canMarkPaid(c) && (
                          <Button size="sm" variant="outline" onClick={() => pro.markPaid(c.sessionId!)}>
                            Marcar como pago
                          </Button>
                        )}
                        {c.paid && (
                          <Button size="sm" variant="ghost" onClick={() => setReceipt(c)}>
                            Recibo
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visible.length > 40 && (
                <p className="pt-2 text-xs text-muted-foreground">
                  Mostrando as 40 mais novas de {visible.length}.
                </p>
              )}
            </div>
          )}
        </Block>
      </PageColumns>

      <Dialog open={receipt !== null} onOpenChange={(open) => !open && setReceipt(null)}>
        <DialogContent className="gap-4 rounded-2xl p-8 sm:max-w-lg">
          {receipt && (
            <>
              <DialogTitle className="text-2xl font-light">Recibo</DialogTitle>
              <DialogDescription className="sr-only">Recibo da sessão para o paciente</DialogDescription>
              <p className="text-base leading-relaxed">
                Recebi de <strong className="font-semibold">{nameOf(receipt.patientId)}</strong>, CPF [CPF DO
                PACIENTE], a quantia de{" "}
                <strong className="font-semibold">{formatCurrencyBRL(receipt.amount)}</strong>, referente a
                uma {me.specialty === "psychiatrist" ? "consulta de psiquiatria" : "sessão de psicoterapia"}{" "}
                realizada em {formatDateBR(receipt.date)}.
              </p>
              <p className="text-sm leading-relaxed">
                {me.name} · {me.register}
                <br />
                CPF [SEU CPF] · [CIDADE], {formatDateBR(pro.today)}
              </p>
              <p className="text-xs text-muted-foreground">
                Serve para o reembolso do convênio e para o imposto de renda do paciente. Os dados entre
                colchetes ficam para você preencher.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.print()}>
                  <Printer />
                  Imprimir
                </Button>
                <Button variant="ghost" onClick={() => setReceipt(null)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}

function Stat({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "brand" | "sun";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "animate-rise rounded-3xl p-5",
        tone === "brand"
          ? "bg-primary text-primary-foreground"
          : tone === "sun"
            ? "bg-sun-300 text-ink"
            : "border border-border bg-card",
      )}
    >
      <dt className="text-sm opacity-85">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight">{children}</dd>
    </div>
  );
}

/** Barras empilhadas por semana: pago (verde) embaixo e pendente (amarelo) em cima. */
function WeekChart({ weeks }: { weeks: ReturnType<typeof weeklyBars> }) {
  const max = Math.max(1, ...weeks.map((w) => w.paid + w.pending));
  const summary = weeks
    .map((w) => `${w.label}: ${formatCurrencyBRL(w.paid)} pago, ${formatCurrencyBRL(w.pending)} pendente`)
    .join("; ");
  return (
    <div>
      <div role="img" aria-label={`Valores por semana. ${summary}.`} className="flex h-48 items-end gap-3">
        {weeks.map((w, i) => {
          const total = w.paid + w.pending;
          return (
            <div key={w.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-medium tabular-nums" aria-hidden>
                {total ? formatCurrencyBRL(total).replace(",00", "") : ""}
              </span>
              <div
                className="animate-grow-up flex w-full max-w-16 flex-col-reverse overflow-hidden rounded-xl"
                style={{ height: `${(total / max) * 100}%`, animationDelay: `${i * 80}ms` }}
              >
                <span className="bg-primary" style={{ height: total ? `${(w.paid / total) * 100}%` : 0 }} />
                <span
                  className="bg-sun-300"
                  style={{ height: total ? `${(w.pending / total) * 100}%` : 0 }}
                />
              </div>
              {total === 0 && <span className="h-1 w-full max-w-16 rounded-full bg-sunken" />}
            </div>
          );
        })}
      </div>
      <div aria-hidden className="mt-2 flex gap-3 text-center text-xs text-muted-foreground">
        {weeks.map((w) => (
          <span key={w.label} className="flex-1">
            {w.label}
          </span>
        ))}
      </div>
      <p aria-hidden className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-primary" /> pago
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-sun-300" /> pendente
        </span>
      </p>
    </div>
  );
}

/** O recebido de cada mês; o mês atual em destaque. */
function MonthChart({ months }: { months: ReturnType<typeof monthlyTotals> }) {
  const max = Math.max(1, ...months.map((m) => m.total));
  return (
    <div>
      <div
        role="img"
        aria-label={`Recebido por mês. ${months.map((m) => `${m.label}: ${formatCurrencyBRL(m.total)}`).join("; ")}.`}
        className="flex h-44 items-end gap-3"
      >
        {months.map((m, i) => {
          const current = i === months.length - 1;
          return (
            <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs tabular-nums" aria-hidden>
                {m.total ? formatCurrencyBRL(m.total).replace(",00", "") : ""}
              </span>
              <span
                className={cn(
                  "animate-grow-up w-full max-w-14 rounded-xl",
                  current ? "bg-primary" : "bg-brand-300",
                )}
                style={{ height: `${Math.max(2, (m.total / max) * 100)}%`, animationDelay: `${i * 70}ms` }}
              />
            </div>
          );
        })}
      </div>
      <div aria-hidden className="mt-2 flex gap-3 text-center text-xs text-muted-foreground">
        {months.map((m, i) => (
          <span key={m.month} className={cn("flex-1", i === months.length - 1 && "font-semibold text-ink")}>
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeeRow({ name, fee, onSave }: { name: string; fee: number; onSave: (value: number) => void }) {
  const [value, setValue] = useState(String(fee));
  const id = `fee-${name.replace(/\s+/g, "-")}`;
  const parsed = Number(value.replace(",", "."));
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && parsed <= FEE_MAX;
  return (
    <li>
      <form
        className="space-y-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave(parsed);
        }}
      >
        <label htmlFor={id} className="block text-sm">
          {name}
        </label>
        <div className="flex items-center gap-2">
          <span aria-hidden className="text-sm text-muted-foreground">
            R$
          </span>
          <input
            id={id}
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={!valid}
            className={cn(fieldControlClass, "h-10 flex-1 text-right")}
          />
          <Button type="submit" size="sm" variant="outline" disabled={!valid || parsed === fee}>
            Salvar
          </Button>
        </div>
      </form>
    </li>
  );
}
