"use client";

import { FileText, Printer, QrCode } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { CHARGES } from "@/features/payments/data";
import { chargesFromClosings, groupByProfessional, totalOpen } from "@/features/payments/logic";
import { CLOSINGS_KEY } from "@/features/pro/hooks/usePro";
import type { SessionClosing } from "@/features/pro/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { PixDialog, type PixTarget } from "@/features/payments/components/PixDialog";
import type { Charge } from "@/features/payments/types";
import { SPECIALTY_LABEL, type Professional } from "@/features/pro/identity";
import { useProfile } from "@/features/profile/useProfile";
import { formatCurrencyBRL, formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const NO_CLOSINGS: SessionClosing[] = [];

export default function PaymentsView() {
  // As cobranças de exemplo e as que os profissionais lançaram ao encerrar as suas consultas.
  const [closings] = useLocalStorage<SessionClosing[]>(CLOSINGS_KEY, NO_CLOSINGS);
  const { appointments } = useAppointments();
  const all = [...CHARGES, ...chargesFromClosings(closings, appointments)];
  const groups = groupByProfessional(all);
  const open = totalOpen(groups);
  const year = new Date().getFullYear();
  const paidThisYear = all
    .filter((c) => c.status === "paid" && c.date.startsWith(String(year)))
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingCount = all.filter((c) => c.status !== "paid").length;
  const [pix, setPix] = useState<PixTarget | null>(null);
  // O mesmo recibo que o profissional emite no financeiro dele.
  const [receipt, setReceipt] = useState<{ charge: Charge; professional: Professional } | null>(null);
  const [profile] = useProfile();

  return (
    <Page
      title="Suas sessões e recibos"
      kicker="Pagamentos"
      description="Cada atendimento é pago direto ao profissional que atendeu você."
      width="wide"
    >
      <DemoNotice>
        Nenhuma cobrança é real. Os valores, o PIX e os profissionais são exemplos para mostrar como seria.
      </DemoNotice>

      {groups.length === 0 ? (
        <EmptyState
          title="Nada para pagar"
          description="Quando um profissional registrar um atendimento, a cobrança aparece aqui, separada por profissional."
        />
      ) : (
        <PageColumns
          aside={
            <>
              <Block tone="sunSoft" title="Em aberto">
                <p className="text-4xl font-semibold tracking-tight">{formatCurrencyBRL(open)}</p>
                <p className="mt-2 text-sm text-sun-700">
                  {open > 0
                    ? `${pendingCount} ${pendingCount === 1 ? "sessão esperando" : "sessões esperando"} pagamento, somando todos os profissionais.`
                    : "Tudo em dia. Não há nada em aberto."}
                </p>
              </Block>
              <Block title={`Pago em ${year}`}>
                <p className="text-3xl font-semibold tracking-tight">{formatCurrencyBRL(paidThisYear)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Os recibos servem para reembolso do convênio e para o imposto de renda.
                </p>
              </Block>
            </>
          }
        >
          {groups.map(({ professional, charges, open: groupOpen }) => (
            <Block
              key={professional.id}
              label={professional.name}
              title={
                <span>
                  <span className="block text-lg font-medium">{professional.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {SPECIALTY_LABEL[professional.specialty]}
                  </span>
                </span>
              }
              aside={
                groupOpen > 0 ? (
                  <>
                    Em aberto: <strong className="text-sun-700">{formatCurrencyBRL(groupOpen)}</strong>
                  </>
                ) : (
                  "Em dia"
                )
              }
            >
              <ul>
                {charges.map((charge) => {
                  const isPaid = charge.status === "paid";
                  return (
                    <li
                      key={charge.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-sunken py-3 first:border-t-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{charge.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDateBR(charge.date)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrencyBRL(charge.amount)}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            isPaid ? "bg-brand-100 text-brand-ink" : "bg-sun-100 text-sun-700",
                          )}
                        >
                          {isPaid ? "Pago" : "Pendente"}
                        </span>
                        {isPaid ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Recibo de ${formatDateBR(charge.date)}`}
                            onClick={() => setReceipt({ charge, professional })}
                          >
                            <FileText />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            aria-label={`Pagar ${professional.name} via PIX`}
                            onClick={() =>
                              setPix({
                                professionalName: professional.name,
                                description: `${charge.description} · ${formatDateBR(charge.date)}`,
                                amount: charge.amount,
                              })
                            }
                          >
                            <QrCode />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Block>
          ))}
        </PageColumns>
      )}

      <PixDialog target={pix} onClose={() => setPix(null)} />

      <Dialog open={receipt !== null} onOpenChange={(open) => !open && setReceipt(null)}>
        <DialogContent className="gap-4 rounded-2xl p-8 sm:max-w-lg">
          {receipt && (
            <>
              <DialogTitle className="text-2xl font-light">Recibo</DialogTitle>
              <DialogDescription className="sr-only">
                Recibo do atendimento, para o convênio e o imposto
              </DialogDescription>
              <p className="text-base leading-relaxed">
                Recebi de <strong className="font-semibold">{profile.name || "Paciente demo"}</strong> a
                quantia de{" "}
                <strong className="font-semibold">{formatCurrencyBRL(receipt.charge.amount)}</strong>,
                referente a {receipt.charge.description.toLowerCase()} de {formatDateBR(receipt.charge.date)}.
              </p>
              <p className="text-sm leading-relaxed">
                {receipt.professional.name} · {receipt.professional.register}
              </p>
              <p className="text-xs text-muted-foreground">
                Serve para o reembolso do convênio e para o imposto de renda. Na demonstração, os dados são de
                exemplo.
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
