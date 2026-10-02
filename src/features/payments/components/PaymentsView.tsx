"use client";

import { CreditCard, FileText, Plus, QrCode, X } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import AddPaymentMethodModal from "@/features/payments/components/AddPaymentMethodModal";
import { PixDialog } from "@/features/payments/components/PixDialog";
import type { Invoice, PaymentMethod, Subscription } from "@/features/payments/types";
import { formatCurrencyBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mocks/user";

const panelClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

export default function PaymentsView() {
  const [invoices] = useState<Invoice[]>(mockUser.invoices);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockUser.paymentMethods);
  const [subscription, setSubscription] = useState<Subscription>(mockUser.subscription);
  const [addOpen, setAddOpen] = useState(false);
  const [pixInvoice, setPixInvoice] = useState<Invoice | null>(null);

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
    setSubscription((current) => ({ ...current, status: current.status === "active" ? "canceled" : "active" }));

  return (
    <Page
      title="Meus Pagamentos"
      description="Gerencie suas faturas, métodos de pagamento e assinatura."
      width="wide"
    >
      <section
        aria-label="Assinatura"
        className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-slate-900 p-6 text-white shadow-sm md:flex-row md:items-center md:p-8"
      >
        <div className="space-y-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
              isActive
                ? "border-brand-500/30 bg-brand-500/20 text-brand-300"
                : "border-red-500/30 bg-red-500/20 text-red-300",
            )}
          >
            <span className={cn("size-2 rounded-full", isActive ? "bg-brand-400" : "bg-red-400")} />
            {isActive ? "Assinatura ativa" : "Assinatura cancelada"}
          </span>
          <h2 className="text-xl font-bold md:text-2xl">{subscription.planName}</h2>
          <p className="text-sm text-slate-400">
            Próxima cobrança: <strong className="text-slate-200">{subscription.nextBillingDate}</strong>
          </p>
        </div>

        <div className="w-full border-t border-slate-800 pt-4 md:w-auto md:border-t-0 md:pt-0 md:text-right">
          <p className="text-xs uppercase tracking-wider text-slate-400">Valor do plano</p>
          <p className="text-3xl font-extrabold text-brand-400">
            {formatCurrencyBRL(subscription.price)}
            <span className="text-xs font-normal text-slate-400"> /mês</span>
          </p>
          <button
            type="button"
            onClick={toggleSubscription}
            className={cn(
              "mt-3 rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-brand-500/10 text-brand-400 hover:bg-brand-500/20",
            )}
          >
            {isActive ? "Cancelar assinatura" : "Reativar assinatura"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <section className={cn(panelClass, "space-y-4 md:col-span-5")}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Métodos de pagamento</h2>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)} className="text-brand-600">
              <Plus />
              Adicionar
            </Button>
          </div>

          {paymentMethods.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">Nenhum método cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {paymentMethods.map((method) => (
                <li
                  key={method.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border p-4",
                    method.isDefault ? "border-brand-500 bg-brand-50/40" : "border-slate-200",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                      {method.type === "pix" ? <QrCode className="size-5" /> : <CreditCard className="size-5" />}
                    </div>
                    {method.type === "pix" ? (
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">Chave PIX</p>
                        <p className="truncate font-mono text-xs text-slate-500">{method.pixKey}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-xs text-slate-500">Expira em {method.expiry}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {method.isDefault ? (
                      <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                        Principal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeDefault(method.id)}
                        className="text-xs text-slate-500 transition-colors hover:text-brand-600"
                      >
                        Tornar principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMethod(method.id)}
                      aria-label="Remover método de pagamento"
                      className="rounded p-1 text-slate-400 transition-colors hover:text-red-500"
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
          <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-800">Histórico de faturas</h2>
          <ul className="space-y-3">
            {invoices.map((invoice) => {
              const isPaid = invoice.status === "paid";
              return (
                <li key={invoice.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{invoice.description}</p>
                    <p className="text-xs text-slate-500">{invoice.date}</p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{formatCurrencyBRL(invoice.amount)}</p>
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold",
                          isPaid ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {isPaid ? "Pago" : "Pendente"}
                      </span>
                    </div>

                    {isPaid ? (
                      <Button variant="ghost" size="icon" disabled title="Recibo disponível em breve" aria-label="Baixar recibo">
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
      <PixDialog invoice={pixInvoice} onClose={() => setPixInvoice(null)} />
    </Page>
  );
}
