"use client";

import { LifeBuoy, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmergencyCalls } from "@/features/safety/components/EmergencyCalls";
import { useSafetyPlan } from "@/features/safety/hooks/useSafetyPlan";
import { isPlanEmpty, phoneHref } from "@/features/safety/logic";

/** Botão sempre visível no painel: leva a quem pode ajudar em uma crise, e ao plano de segurança da pessoa. */
export function CrisisButton() {
  const { plan } = useSafetyPlan();
  const hasPlan = !isPlanEmpty(plan);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Preciso de ajuda"
          className="fixed right-3 bottom-24 z-40 flex size-11 items-center justify-center gap-2 rounded-full bg-strong text-xs font-semibold text-white shadow-lg transition-colors hover:bg-brand-900 focus-visible:ring-3 focus-visible:ring-sun-300 focus-visible:outline-none md:right-6 md:bottom-6 md:size-auto md:px-4 md:py-2.5"
        >
          <LifeBuoy className="size-5 md:size-4" aria-hidden />
          <span className="hidden md:inline">Preciso de ajuda</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92dvh] gap-4 overflow-y-auto rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Você não está sozinho(a)</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Se você está em sofrimento ou pensando em se machucar, fale com alguém agora. A ligação é gratuita.
        </DialogDescription>

        <EmergencyCalls />

        {hasPlan ? (
          <section aria-labelledby="crisis-plan" className="space-y-3 border-t border-border pt-4">
            <h3 id="crisis-plan" className="text-sm font-semibold text-foreground">
              Do seu plano
            </h3>
            {plan.coping.length > 0 && (
              <ul className="space-y-1 text-sm text-foreground">
                {plan.coping.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-brand-400">
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {plan.contacts.slice(0, 3).map((contact) => (
              <a
                key={contact.id}
                href={phoneHref(contact.phone)}
                className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-sunken px-4 text-sm transition-colors hover:border-brand-600"
              >
                <span>
                  <span className="font-semibold text-foreground">{contact.name}</span>
                  {contact.role && <span className="text-muted-foreground"> · {contact.role}</span>}
                </span>
                <Phone className="size-4 text-brand-accent" aria-hidden />
              </a>
            ))}
            <Link href="/dashboard/safety" className="text-sm font-semibold text-brand-ink hover:underline">
              Abrir meu plano completo
            </Link>
          </section>
        ) : (
          <Link
            href="/dashboard/safety"
            className="rounded-xl border border-dashed border-input p-4 text-sm text-muted-foreground transition-colors hover:border-brand-600"
          >
            <span className="block font-semibold text-foreground">Monte seu plano de segurança</span>
            Nos dias calmos, escreva o que ajuda e quem você pode chamar. Ele aparece aqui quando precisar.
          </Link>
        )}

        <Button asChild variant="outline">
          <Link href="/dashboard/breathing">Fazer um exercício de respiração</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
