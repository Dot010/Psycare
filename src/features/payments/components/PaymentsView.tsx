"use client";

import { useState } from "react";
import { mockUser } from "@/data/mockData";
import type { Invoice, PaymentMethod, Subscription } from "@/types/domain";
import AddPaymentMethodModal from "@/features/payments/components/AddPaymentMethodModal";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Payments() {
  const [invoices] = useState<Invoice[]>(mockUser.invoices);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    mockUser.paymentMethods,
  );
  const [subscription, setSubscription] = useState<Subscription>(
    mockUser.subscription,
  );

  // Estados de Modais e Notificações
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPixInvoice, setSelectedPixInvoice] = useState<Invoice | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // Código PIX Copia e Cola simulado
  const mockPixCode =
    "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540599.905802BR5913Empresa Demo6009Sao Paulo62070503***6304E2CA";

  const handleDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
  };
  // Adicionar novo método de pagamento
  const handleAddPaymentMethod = (newMethod: PaymentMethod) => {
    setPaymentMethods((prev) => {
      if (newMethod.isDefault) {
        return [...prev.map((m) => ({ ...m, isDefault: false })), newMethod];
      }
      return [...prev, newMethod];
    });
  };
  // Deletar método de pagamento
  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => {
      const updated = prev.filter((method) => method.id !== id);
      const deletedWasDefault = prev.find((m) => m.id === id)?.isDefault;

      if (deletedWasDefault && updated.length > 0) {
        updated[0].isDefault = true;
      }

      return updated;
    });
  };

  const handleToggleCancelSubscription = () => {
    setSubscription((prev) => ({
      ...prev,
      status: prev.status === "active" ? "canceled" : "active",
    }));
  };

  // Copiar PIX Copia e Cola
  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(mockPixCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback simples
      alert("Código PIX copiado para a área de transferência!");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* header */}
      <div>
        <AnimatedText as="h1" text="Meus Pagamentos" className="text-2xl font-bold text-slate-800" />
        <p className="text-slate-500 text-sm mt-1">
          Gerencie suas faturas, métodos de pagamento e assinatura.
        </p>
      </div>

      {/*  Banner da Assinatura */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${
              subscription.status === "active"
                ? "bg-brand-500/20 text-brand-300 border-brand-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                subscription.status === "active"
                  ? "bg-brand-400 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            {subscription.status === "active"
              ? "Assinatura Ativa"
              : "Assinatura Cancelada"}
          </span>

          <h2 className="text-xl md:text-2xl font-bold">
            {subscription.planName}
          </h2>
          <p className="text-slate-400 text-sm">
            Próxima cobrança:{" "}
            <strong className="text-slate-200">
              {subscription.nextBillingDate}
            </strong>
          </p>
        </div>

        <div className="text-left md:text-right border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 w-full md:w-auto">
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            Valor do plano
          </p>
          <p className="text-3xl font-extrabold text-brand-400">
            R$ {subscription.price.toFixed(2).replace(".", ",")}
            <span className="text-xs text-slate-400 font-normal"> /mês</span>
          </p>

          <button
            type="button"
            onClick={handleToggleCancelSubscription}
            className={`mt-3 text-xs font-semibold px-4 py-2 rounded-xl transition ${
              subscription.status === "active"
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-brand-500/10 text-brand-400 hover:bg-brand-500/20"
            }`}
          >
            {subscription.status === "active"
              ? "Cancelar Assinatura"
              : "Reativar Assinatura"}
          </button>
        </div>
      </div>

      {/* . Grid  */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Métodos de Pagamento */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-base">
              Métodos de Pagamento
            </h2>
            <MagneticButton
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              + Adicionar
            </MagneticButton>
          </div>

          <div className="space-y-3">
            {paymentMethods.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Nenhum método cadastrado.
              </p>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between ${
                    method.isDefault
                      ? "border-brand-500 bg-brand-50/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-lg">
                      {method.type === "pix" ? "❖" : "💳"}
                    </div>
                    <div>
                      {method.type === "pix" ? (
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            Chave PIX
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {method.pixKey}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-xs text-slate-500">
                            Expira em {method.expiry}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {method.isDefault ? (
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                        Principal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDefaultPaymentMethod(method.id)}
                        className="text-xs text-slate-400 hover:text-brand-600 transition"
                      >
                        Tornar principal
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      title="Remover método"
                      className="text-xs text-slate-300 hover:text-red-500 transition ml-1 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Histórico de Faturas */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Histórico de Faturas
          </h2>

          <div className="space-y-3">
            {invoices.map((invoice) => {
              const isPaid = invoice.status === "paid";

              return (
                <div
                  key={invoice.id}
                  className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-800">
                      {invoice.description}
                    </p>
                    <p className="text-xs text-slate-400">{invoice.date}</p>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        R$ {invoice.amount.toFixed(2).replace(".", ",")}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isPaid
                            ? "text-brand-700 bg-brand-50"
                            : "text-amber-700 bg-amber-50"
                        }`}
                      >
                        {isPaid ? "Pago" : "Pendente"}
                      </span>
                    </div>

                    {!isPaid ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPixInvoice(invoice)}
                        className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition flex items-center gap-1 shadow-sm"
                      >
                        <span>❖</span> Pagar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          alert(`Baixando recibo da fatura ${invoice.id}...`)
                        }
                        title="Baixar recibo"
                        className="p-2 text-slate-400 hover:text-brand-600 transition"
                      >
                        📄
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal para Adicionar Método de Pagamento */}
      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPaymentMethod={handleAddPaymentMethod}
        isFirstMethod={paymentMethods.length === 0}
      />

      {/*  Modal de Pagamento via QR Code PIX */}
      {selectedPixInvoice && (
        <Dialog open onOpenChange={(open) => { if (!open) setSelectedPixInvoice(null); }}>
          <DialogContent aria-describedby={undefined} className="gap-5 rounded-3xl p-6 text-center sm:max-w-sm">
            <DialogTitle className="border-b border-slate-100 pb-3 text-base font-bold text-slate-800">Pagamento via PIX</DialogTitle>

            <p className="text-xs text-slate-500">
              Escaneie o QR Code abaixo com o aplicativo do seu banco para pagar{" "}
              <strong className="text-slate-800">
                R$ {selectedPixInvoice.amount.toFixed(2).replace(".", ",")}
              </strong>
            </p>

            {/* Simulação de QR Code */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center">
              <div className="w-40 h-40 bg-slate-900 rounded-xl flex items-center justify-center p-2 shadow-inner">
                <div className="w-full h-full border-4 border-dashed border-white/40 rounded flex items-center justify-center text-white text-xs font-mono">
                  ❖ QR CODE
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-mono">
                Vencimento em 15 minutos
              </span>
            </div>

            {/* Código PIX Copia e Cola */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-500 text-left">
                Ou use o código Copia e Cola:
              </p>
              <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-600 truncate border border-slate-200 text-left">
                {mockPixCode}
              </div>

              <button
                type="button"
                onClick={handleCopyPixCode}
                className={`w-full py-2.5 text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2 ${
                  copiedCode
                    ? "bg-brand-800 text-white"
                    : "bg-brand-600 hover:bg-brand-700 text-white"
                }`}
              >
                {copiedCode ? "✓ Código Copiado!" : "Copiar Código PIX"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
