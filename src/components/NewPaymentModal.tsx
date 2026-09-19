"use client";

import { useState, useEffect, useCallback } from "react";
import { PaymentMethod } from "@/data/mockData";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod: (newMethod: PaymentMethod) => void;
  isFirstMethod: boolean;
}

type PixKeyType = "cpf" | "email" | "phone" | "random";

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAddPaymentMethod,
  isFirstMethod,
}: AddPaymentMethodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"credit_card" | "pix">("credit_card");

  // Campos do Cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardExpiry, setCardExpiry] = useState("");

  // Campos do PIX
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [pixKey, setPixKey] = useState("");

  // Reset de formulário
  const resetForm = useCallback(() => {
    setCardNumber("");
    setCardExpiry("");
    setPixKey("");
    setPixKeyType("cpf");
    setCardBrand("Visa");
    setPaymentType("credit_card");
  }, []);

  // Fechamento seguro
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, resetForm, onClose]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Máscaras de Cartão
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
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

    // Simulação de gateway de pagamento
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (paymentType === "credit_card") {
      const rawNumber = cardNumber.replace(/\s/g, "");
      const last4 = rawNumber.slice(-4) || "0000";

      onAddPaymentMethod({
        id: crypto.randomUUID(),
        type: "credit_card",
        brand: cardBrand,
        last4,
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

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 text-lg">
            Novo Método de Pagamento
          </h3>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 disabled:bg-slate-50"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Elo">Elo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  maxLength={19}
                  disabled={isSubmitting}
                  onChange={handleCardNumberChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 disabled:bg-slate-50"
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 disabled:bg-slate-50"
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 disabled:bg-slate-50"
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 disabled:bg-slate-50 font-mono"
                />
              </div>

              {/* Card informativo sobre cobrança PIX */}
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                <span className="text-base">ℹ️</span>
                <p>
                  No dia da renovação, um código <strong>PIX Copia e Cola</strong> e o <strong>QR Code</strong> serão enviados para sua chave/e-mail para pagamento instantâneo.
                </p>
              </div>
            </div>
          )}

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
              className="flex-1 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}