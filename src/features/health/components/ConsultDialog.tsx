"use client";

import { Copy, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface ConsultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: string[];
}

export function ConsultDialog({ open, onOpenChange, lines }: ConsultDialogProps) {
  const [copied, setCopied] = useState(false);
  const text = lines.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto rounded-2xl p-6 sm:max-w-lg">
        <DialogTitle className="text-xl font-bold text-foreground">Resumo para a consulta</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Montado só com o que você registrou. Confira antes de mostrar.
        </DialogDescription>
        <pre
          aria-label="Texto do resumo"
          className="rounded-xl bg-sunken p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground"
        >
          {text}
        </pre>
        <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Imprimir
          </Button>
          <Button onClick={copy}>
            <Copy />
            {copied ? "Copiado" : "Copiar texto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
