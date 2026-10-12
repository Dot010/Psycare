"use client";

import { FileText, QrCode } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { CHARGES } from "@/features/payments/data";
import { groupByProfessional, totalOpen } from "@/features/payments/logic";
import { PixDialog, type PixTarget } from "@/features/payments/components/PixDialog";
import { SPECIALTY_LABEL } from "@/features/pro/identity";
import { formatCurrencyBRL, formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const panelClass = "rounded-2xl border border-border bg-card p-6 shadow-sm";

export default function PaymentsView() {
  const groups = groupByProfessional(CHARGES);
  const open = totalOpen(groups);
  const [pix, setPix] = useState<PixTarget | null>(null);

  return (
    <Page
      title="Pagamentos"
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
        <>
          <p className="text-sm text-muted-foreground">
            {open > 0 ? (
              <>
                Em aberto, somando todos os profissionais:{" "}
                <strong className="text-foreground">{formatCurrencyBRL(open)}</strong>
              </>
            ) : (
              "Tudo em dia. Não há nada em aberto."
            )}
          </p>

          <div className="space-y-6">
            {groups.map(({ professional, charges, open: groupOpen }) => (
              <section
                key={professional.id}
                aria-label={professional.name}
                className={cn(panelClass, "space-y-4")}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h2 className="text-base font-bold text-foreground">{professional.name}</h2>
                    <p className="text-xs text-muted-foreground">{SPECIALTY_LABEL[professional.specialty]}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {groupOpen > 0 ? (
                      <>
                        Em aberto: <strong className="text-sun-700">{formatCurrencyBRL(groupOpen)}</strong>
                      </>
                    ) : (
                      "Em dia"
                    )}
                  </p>
                </div>

                <ul className="space-y-3">
                  {charges.map((charge) => {
                    const isPaid = charge.status === "paid";
                    return (
                      <li
                        key={charge.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{charge.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDateBR(charge.date)}</p>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {formatCurrencyBRL(charge.amount)}
                            </p>
                            <span
                              className={cn(
                                "inline-block rounded-md px-2 py-0.5 text-xs font-semibold",
                                isPaid ? "bg-brand-50 text-brand-ink" : "bg-sun-50 text-sun-700",
                              )}
                            >
                              {isPaid ? "Pago" : "Pendente"}
                            </span>
                          </div>

                          {isPaid ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              title="Recibo disponível em breve"
                              aria-label="Baixar recibo"
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
              </section>
            ))}
          </div>
        </>
      )}

      <PixDialog target={pix} onClose={() => setPix(null)} />
    </Page>
  );
}
