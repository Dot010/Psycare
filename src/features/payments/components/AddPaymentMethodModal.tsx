"use client";

import { CreditCard, Info, QrCode } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field, SelectField } from "@/components/ui/field";
import type { PaymentMethod } from "@/features/payments/types";
import { cn } from "@/lib/utils";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod: (newMethod: PaymentMethod) => void;
  isFirstMethod: boolean;
}

type PaymentType = "credit_card" | "pix";
type PixKeyType = "cpf" | "email" | "phone" | "random";

const creditCardSchema = z.object({
  brand: z.string().min(2),
  // Nunca coletamos o número completo: só os 4 últimos dígitos (o resto é tarefa do gateway).
  last4: z.string().regex(/^\d{4}$/, "Informe apenas os 4 últimos dígitos"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Validade inválida"),
});

const pixSchema = z.object({
  keyType: z.enum(["cpf", "email", "phone", "random"]),
  key: z.string().trim().min(4, "Chave PIX inválida"),
});

const PIX_PLACEHOLDERS: Record<PixKeyType, string> = {
  cpf: "000.000.000-00",
  email: "seu@email.com",
  phone: "(11) 99999-9999",
  random: "00000000-0000-0000-0000-000000000000",
};

const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

function maskExpiry(value: string) {
  const digits = onlyDigits(value, 4);
  return digits.length >= 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function maskPixKey(type: PixKeyType, value: string) {
  if (type === "cpf") {
    return onlyDigits(value, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  if (type === "phone") {
    return onlyDigits(value, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2");
  }
  return value;
}

const TYPE_OPTIONS = [
  { id: "credit_card", label: "Cartão de crédito", Icon: CreditCard },
  { id: "pix", label: "PIX", Icon: QrCode },
] as const;

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAddPaymentMethod,
  isFirstMethod,
}: AddPaymentMethodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("credit_card");
  const [brand, setBrand] = useState("Visa");
  const [last4, setLast4] = useState("");
  const [expiry, setExpiry] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>("cpf");
  const [pixKey, setPixKey] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setPaymentType("credit_card");
    setBrand("Visa");
    setLast4("");
    setExpiry("");
    setPixKeyType("cpf");
    setPixKey("");
    setFormError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation =
      paymentType === "credit_card"
        ? creditCardSchema.safeParse({ brand, last4, expiry })
        : pixSchema.safeParse({ keyType: pixKeyType, key: pixKey });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    // Simula a chamada ao gateway de pagamento.
    await new Promise((resolve) => setTimeout(resolve, 800));

    onAddPaymentMethod(
      paymentType === "credit_card"
        ? { id: crypto.randomUUID(), type: "credit_card", brand, last4, expiry, isDefault: isFirstMethod }
        : {
            id: crypto.randomUUID(),
            type: "pix",
            pixKey: `${pixKey} (${pixKeyType.toUpperCase()})`,
            isDefault: isFirstMethod,
          },
    );

    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent aria-describedby={undefined} className="gap-5 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-slate-800">Novo método de pagamento</DialogTitle>

        <div role="group" aria-label="Tipo de método" className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {TYPE_OPTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              disabled={isSubmitting}
              aria-pressed={paymentType === id}
              onClick={() => setPaymentType(id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors",
                paymentType === id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            Demonstração: não informe dados reais. O número completo do cartão nunca é solicitado aqui; o pagamento
            real será feito em um checkout seguro do gateway.
          </p>

          {paymentType === "credit_card" ? (
            <>
              <SelectField label="Bandeira" value={brand} disabled={isSubmitting} onChange={(e) => setBrand(e.target.value)}>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
              </SelectField>
              <Field
                label="Últimos 4 dígitos do cartão"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0000"
                maxLength={4}
                required
                disabled={isSubmitting}
                value={last4}
                onChange={(e) => setLast4(onlyDigits(e.target.value, 4))}
              />
              <Field
                label="Validade (MM/AA)"
                placeholder="MM/AA"
                maxLength={5}
                required
                disabled={isSubmitting}
                value={expiry}
                onChange={(e) => setExpiry(maskExpiry(e.target.value))}
              />
            </>
          ) : (
            <>
              <SelectField
                label="Tipo de chave PIX"
                value={pixKeyType}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPixKeyType(e.target.value as PixKeyType);
                  setPixKey("");
                }}
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Celular</option>
                <option value="random">Chave aleatória (EVP)</option>
              </SelectField>
              <Field
                label="Chave PIX"
                type={pixKeyType === "email" ? "email" : "text"}
                placeholder={PIX_PLACEHOLDERS[pixKeyType]}
                required
                disabled={isSubmitting}
                className="font-mono"
                value={pixKey}
                onChange={(e) => setPixKey(maskPixKey(pixKeyType, e.target.value))}
              />
              <p className="flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-800">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  No dia da renovação, um código <strong>PIX Copia e Cola</strong> e o <strong>QR Code</strong> serão
                  enviados para o seu e-mail.
                </span>
              </p>
            </>
          )}

          {formError && (
            <p role="alert" className="text-xs text-red-600">
              {formError}
            </p>
          )}

          <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar método"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
