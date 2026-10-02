"use client";

import { useState, useCallback } from "react";
import type { PaymentMethod } from "@/types/domain";
import { z } from "zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod: (newMethod: PaymentMethod) => void;
  isFirstMethod: boolean;
}

type PixKeyType = "cpf" | "email" | "phone" | "random";

const creditCardSchema = z.object({
  cardBrand: z.string().min(2),
  // Nunca coletamos o número completo: só os 4 últimos dígitos (o resto é tarefa do gateway).
  cardLast4: z.string().regex(/^\d{4}$/, "Informe apenas os 4 últimos dígitos"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Validade inválida"),
});

const pixSchema = z.object({
  pixKeyType: z.enum(["cpf", "email", "phone", "random"]),
  pixKey: z.string().trim().min(4, "Chave PIX inválida"),
});

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAddPaymentMethod,
  isFirstMethod,
}: AddPaymentMethodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"credit_card" | "pix">("credit_card");

  // Campos do Cartão
  const [cardLast4, setCardLast4] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardExpiry, setCardExpiry] = useState("");

  // Campos do PIX
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [pixKey, setPixKey] = useState("");
  const [formError, setFormError] = useState("");

  // Reset de formulário
  const resetForm = useCallback(() => {
    setCardLast4("");
    setCardExpiry("");
    setPixKey("");
    setPixKeyType("cpf");
    setCardBrand("Visa");
    setPaymentType("credit_card");
    setFormError("");
  }, []);

  // Fechamento seguro
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, resetForm, onClose]);

  // Máscaras de Cartão
  const handleCardLast4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardLast4(e.target.value.replace(/\D/g, "").substring(0, 4));
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "").substring(0, 4);
    const formatted =
      rawValue.length >= 2
        ? `${rawValue.substring(0, 2)}/${rawValue.substring(2)}`
        : rawValue;
    setCardExpiry(formatted);
  };

  // Máscara dinâmica de Chave PIX
  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (pixKeyType === "cpf") {
      const numbers = raw.replace(/\D/g, "").substring(0, 11);
      const formatted = numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setPixKey(formatted);
    } else if (pixKeyType === "phone") {
      const numbers = raw.replace(/\D/g, "").substring(0, 11);
      const formatted = numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{4})$/, "$1-$2");
      setPixKey(formatted);
    } else {
      setPixKey(raw);
    }
  };

  const handlePixKeyTypeChange = (type: PixKeyType) => {
    setPixKeyType(type);
    setPixKey("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (paymentType === "credit_card") {
      const cardValidation = creditCardSchema.safeParse({
        cardBrand,
        cardLast4,
        cardExpiry,
      });

      if (!cardValidation.success) {
        setIsSubmitting(false);
        setFormError(cardValidation.error.issues[0]?.message || "Dados inválidos");
        return;
      }
    }

    if (paymentType === "pix") {
      const pixValidation = pixSchema.safeParse({
        pixKeyType,
        pixKey,
      });

      if (!pixValidation.success) {
        setIsSubmitting(false);
        setFormError(pixValidation.error.issues[0]?.message || "Dados inválidos");
        return;
      }
    }

    setFormError("");

    // Simulação de gateway de pagamento
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (paymentType === "credit_card") {
      onAddPaymentMethod({
        id: crypto.randomUUID(),
        type: "credit_card",
        brand: cardBrand,
        last4: cardLast4,
        expiry: cardExpiry || "12/28",
        isDefault: isFirstMethod,
      });
    } else {
      onAddPaymentMethod({
        id: crypto.randomUUID(),
        type: "pix",
        pixKey: `${pixKey} (${pixKeyType.toUpperCase()})`,
        isDefault: isFirstMethod,
      });
    }

    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent aria-describedby={undefined} className="gap-6 rounded-3xl p-6 sm:max-w-md">
        <DialogTitle className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-800">Novo Método de Pagamento</DialogTitle>

        {/* Seleção de Tipo */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setPaymentType("credit_card")}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              paymentType === "credit_card"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            💳 Cartão de Crédito
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setPaymentType("pix")}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              paymentType === "pix"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            ❖ PIX
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            Demonstração: não informe dados reais. O número completo do cartão nunca é solicitado
            aqui; o pagamento real será feito em um checkout seguro do gateway.
          </p>

          {paymentType === "credit_card" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Bandeira
                </label>
                <select
                  value={cardBrand}
                  disabled={isSubmitting}
                  onChange={(e) => setCardBrand(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 disabled:bg-slate-50"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Elo">Elo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Últimos 4 dígitos do cartão
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0000"
                  value={cardLast4}
                  maxLength={4}
                  disabled={isSubmitting}
                  onChange={handleCardLast4Change}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Validade (MM/AA)
                </label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  maxLength={5}
                  disabled={isSubmitting}
                  onChange={handleCardExpiryChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 disabled:bg-slate-50"
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tipo de Chave PIX
                </label>
                <select
                  value={pixKeyType}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    handlePixKeyTypeChange(e.target.value as PixKeyType)
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 disabled:bg-slate-50"
                >
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Chave PIX
                </label>
                <input
                  type={pixKeyType === "email" ? "email" : "text"}
                  placeholder={
                    pixKeyType === "cpf"
                      ? "000.000.000-00"
                      : pixKeyType === "email"
                      ? "seu@email.com"
                      : pixKeyType === "phone"
                      ? "(11) 99999-9999"
                      : "00000000-0000-0000-0000-000000000000"
                  }
                  value={pixKey}
                  disabled={isSubmitting}
                  onChange={handlePixKeyChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 disabled:bg-slate-50 font-mono"
                />
              </div>

              {/* Card informativo sobre cobrança PIX */}
              <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-start gap-2 text-xs text-brand-800">
                <span className="text-base">ℹ️</span>
                <p>
                  No dia da renovação, um código <strong>PIX Copia e Cola</strong> e o <strong>QR Code</strong> serão enviados para sua chave/e-mail para pagamento instantâneo.
                </p>
              </div>
            </div>
          )}

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          {/* Botões do Rodapé */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Método"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}