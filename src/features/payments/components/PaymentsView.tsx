"use client";

import { CreditCard, FileText, Plus, QrCode, X } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import AddPaymentMethodModal from "@/features/payments/components/AddPaymentMethodModal";
import { PixDialog } from "@/features/payments/components/PixDialog";
import type { Invoice, PaymentMethod, Subscription } from "@/features/payments/types";
import { formatCurrencyBRL } from "@/lib/format";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mocks/user";

const panelClass = "rounded-2xl border border-border bg-card p-6 shadow-sm";

export default function PaymentsView() {
  const invoices: Invoice[] = mockUser.invoices;
  const [paymentMethods, setPaymentMethods] = useLocalStorage<PaymentMethod[]>(
    "psycare:payment-methods:v1",
    mockUser.paymentMethods,
  );
  const [subscription, setSubscription] = useLocalStorage<Subscription>(
    "psycare:subscription:v1",
    mockUser.subscription,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [pixInvoice, setPixInvoice] = useState<Invoice | null>(null);
  const [removing, setRemoving] = useState<PaymentMethod | null>(null);
  const [cancelingPlan, setCancelingPlan] = useState(false);

  const isActive = subscription.status === "active";

  const makeDefault = (id: string) =>
    setPaymentMethods((current) => current.map((method) => ({ ...method, isDefault: method.id === id })));

  const addMethod = (newMethod: PaymentMethod) =>
    setPaymentMethods((current) => [
      ...(newMethod.isDefault ? current.map((method) => ({ ...method, isDefault: false })) : current),
      newMethod,
    ]);

  const removeMethod = (id: string) =>
    setPaymentMethods((current) => {
      const remaining = current.filter((method) => method.id !== id);
      const removedWasDefault = current.find((method) => method.id === id)?.isDefault;
      if (!removedWasDefault || remaining.length === 0) return remaining;
      return remaining.map((method, index) => (index === 0 ? { ...method, isDefault: true } : method));
    });

  const toggleSubscription = () =>
    setSubscription((current) => ({
      ...current,
      status: current.status === "active" ? "canceled" : "active",
    }));

  return (
    <Page
      title="Meus Pagamentos"
      description="Gerencie suas faturas, métodos de pagamento e assinatura."
      width="wide"
    >
      <DemoNotice>
        Nenhuma cobrança é real. Planos, faturas e cartões são exemplos para mostrar como seria.
      </DemoNotice>
      <section
        aria-label="Assinatura"
        className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-strong p-6 text-white shadow-sm md:flex-row md:items-center md:p-8"
      >
        <div className="space-y-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
              isActive
                ? "border-brand-500/30 bg-brand-500/20 text-brand-300"
                : "border-danger-500/30 bg-danger-500/20 text-danger-300",
            )}
          >
            <span className={cn("size-2 rounded-full", isActive ? "bg-brand-400" : "bg-danger-300")} />
            {isActive ? "Assinatura ativa" : "Assinatura cancelada"}
          </span>
          <h2 className="text-xl font-bold md:text-2xl">{subscription.planName}</h2>
          <p className="text-sm text-white/70">
            Próxima cobrança: <strong className="text-white/85">{subscription.nextBillingDate}</strong>
          </p>
        </div>

        <div className="w-full border-t border-white/15 pt-4 md:w-auto md:border-t-0 md:pt-0 md:text-right">
          <p className="text-xs uppercase tracking-wider text-white/70">Valor do plano</p>
          <p className="text-3xl font-extrabold text-sun-300">
            {formatCurrencyBRL(subscription.price)}
            <span className="text-xs font-normal text-white/70"> /mês</span>
          </p>
          <button
            type="button"
            onClick={() => (isActive ? setCancelingPlan(true) : toggleSubscription())}
            className={cn(
              "mt-3 rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "bg-danger-500/10 text-danger-300 hover:bg-danger-500/20"
                : "bg-brand-500/10 text-brand-400 hover:bg-brand-500/20",
            )}
          >
            {isActive ? "Cancelar assinatura" : "Reativar assinatura"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <section className={cn(panelClass, "space-y-4 md:col-span-5")}>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">Métodos de pagamento</h2>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)} className="text-brand-accent">
              <Plus />
              Adicionar
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <EmptyState
              title="Nenhum método cadastrado"
              description="Adicione um cartão ou uma chave PIX para pagar suas faturas."
              action={
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus />
                  Adicionar método
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {paymentMethods.map((method) => (
                <li
                  key={method.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border p-4",
                    method.isDefault ? "border-brand-500 bg-brand-50/40" : "border-border",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-sunken p-2.5 text-muted-foreground">
                      {method.type === "pix" ? (
                        <QrCode className="size-5" />
                      ) : (
                        <CreditCard className="size-5" />
                      )}
                    </div>
                    {method.type === "pix" ? (
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">Chave PIX</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{method.pixKey}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-xs text-muted-foreground">Expira em {method.expiry}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {method.isDefault ? (
                      <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-ink">
                        Principal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeDefault(method.id)}
                        className="text-xs text-muted-foreground transition-colors hover:text-brand-accent"
                      >
                        Tornar principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setRemoving(method)}
                      aria-label="Remover método de pagamento"
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-danger-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cn(panelClass, "space-y-4 md:col-span-7")}>
          <h2 className="border-b border-border pb-3 text-base font-bold text-foreground">
            Histórico de faturas
          </h2>
          <ul className="space-y-3">
            {invoices.map((invoice) => {
              const isPaid = invoice.status === "paid";
              return (
                <li
                  key={invoice.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-foreground">{formatCurrencyBRL(invoice.amount)}</p>
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
                      <Button size="sm" onClick={() => setPixInvoice(invoice)}>
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
      </div>

      <AddPaymentMethodModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAddPaymentMethod={addMethod}
        isFirstMethod={paymentMethods.length === 0}
      />
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remover método de pagamento?"
        description={
          removing?.type === "pix"
            ? "A chave PIX será removida da sua conta."
            : `O cartão ${removing?.brand ?? ""} final ${removing?.last4 ?? ""} será removido da sua conta.`
        }
        confirmLabel="Remover"
        onConfirm={() => removing && removeMethod(removing.id)}
      />
      <ConfirmDialog
        open={cancelingPlan}
        onOpenChange={setCancelingPlan}
        title="Cancelar assinatura?"
        description="Você mantém o acesso até o fim do período já pago e pode reativar quando quiser."
        confirmLabel="Cancelar assinatura"
        onConfirm={toggleSubscription}
      />
      <PixDialog invoice={pixInvoice} onClose={() => setPixInvoice(null)} />
    </Page>
  );
}
