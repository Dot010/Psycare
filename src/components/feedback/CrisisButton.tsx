"use client";

import { LifeBuoy, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Botão sempre visível no painel: leva a quem pode ajudar em uma crise. */
export function CrisisButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed right-4 bottom-24 z-40 flex items-center gap-2 rounded-full bg-strong px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-brand-900 focus-visible:ring-3 focus-visible:ring-sun-300 focus-visible:outline-none md:right-6 md:bottom-6"
        >
          <LifeBuoy className="size-4" aria-hidden />
          Preciso de ajuda
        </button>
      </DialogTrigger>

      <DialogContent className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Você não está sozinho(a)</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Se você está em sofrimento ou pensando em se machucar, fale com alguém agora. A ligação é gratuita.
        </DialogDescription>

        <div className="space-y-3">
          <a
            href="tel:188"
            className="flex items-center gap-3 rounded-xl border border-border bg-sunken p-4 transition-colors hover:border-brand-600"
          >
            <Phone className="size-5 text-brand-accent" aria-hidden />
            <span>
              <span className="block font-semibold text-foreground">CVV: 188</span>
              <span className="block text-xs text-muted-foreground">
                Apoio emocional, 24 horas. Também por chat em cvv.org.br.
              </span>
            </span>
          </a>
          <a
            href="tel:192"
            className="flex items-center gap-3 rounded-xl border border-border bg-sunken p-4 transition-colors hover:border-brand-600"
          >
            <Phone className="size-5 text-danger-600" aria-hidden />
            <span>
              <span className="block font-semibold text-foreground">SAMU: 192</span>
              <span className="block text-xs text-muted-foreground">
                Emergência médica, risco imediato à vida.
              </span>
            </span>
          </a>
        </div>

        <Button asChild variant="outline">
          <Link href="/dashboard/breathing">Fazer um exercício de respiração</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
