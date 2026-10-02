"use client";

import { Check, Copy, QrCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrencyBRL } from "@/lib/format";
import type { Invoice } from "@/features/payments/types";

// Código fictício: serve só para a demonstração.
const DEMO_PIX_CODE =
  "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540599.905802BR5913Empresa Demo6009Sao Paulo62070503***6304E2CA";

interface PixDialogProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function PixDialog({ invoice, onClose }: PixDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_PIX_CODE);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <Dialog open={invoice !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="gap-5 rounded-2xl p-6 text-center sm:max-w-sm">
        <DialogTitle className="border-b border-border pb-3 text-base font-bold text-foreground">
          Pagamento via PIX
        </DialogTitle>

        {invoice && (
          <p className="text-xs text-muted-foreground">
            Escaneie o QR Code com o aplicativo do seu banco para pagar{" "}
            <strong className="text-foreground">{formatCurrencyBRL(invoice.amount)}</strong>
          </p>
        )}

        <div className="flex flex-col items-center rounded-2xl border border-border bg-sunken p-6">
          <div className="flex size-40 items-center justify-center rounded-xl bg-ink text-white/70">
            <QrCode className="size-20" aria-hidden />
            <span className="sr-only">QR Code de demonstração</span>
          </div>
          <span className="mt-2 font-mono text-xs text-muted-foreground">Vencimento em 15 minutos</span>
        </div>

        <div className="space-y-2 text-left">
          <p className="text-xs font-medium text-muted-foreground">Ou use o código Copia e Cola:</p>
          <div className="truncate rounded-xl border border-border bg-sunken p-2.5 font-mono text-xs text-muted-foreground">
            {DEMO_PIX_CODE}
          </div>
          <Button onClick={copyCode} className="w-full">
            {copied ? <Check /> : <Copy />}
            {copied ? "Código copiado" : "Copiar código PIX"}
          </Button>
          {copyFailed && (
            <p role="alert" className="text-xs text-danger-600">
              Não foi possível copiar. Selecione o código acima e copie manualmente.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
