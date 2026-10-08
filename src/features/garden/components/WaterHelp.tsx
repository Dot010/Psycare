"use client";

import { CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WaterHelpProps {
  poured: number;
  toNext: number | null;
  children: React.ReactNode;
}

/** Janela "Como o jardim cresce": explica a regra em 3 passos. O gatilho é o `children`. */
export function WaterHelp({ poured, toNext, children }: WaterHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
          <CircleHelp className="size-5 text-brand-accent" aria-hidden />
          Como o jardim cresce
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Cuidar de você é o que faz o jardim crescer. Ele nunca murcha: se ficar um dia sem cuidar, nada se
          perde.
        </DialogDescription>

        <ol className="space-y-3 text-sm text-foreground">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              1
            </span>
            <span>
              <strong>Cuide de você.</strong> Faça check-in, conclua um hábito, escreva no diário ou respire:
              cada ação enche o regador com 1 gota por dia.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              2
            </span>
            <span>
              <strong>Toque em Regar.</strong> As gotas do regador caem sobre as plantas, uma de cada vez.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              3
            </span>
            <span>
              <strong>Veja crescer.</strong> Com mais gotas despejadas, as plantas crescem e novas aparecem.
            </span>
          </li>
        </ol>

        <p className="rounded-xl bg-sunken p-3 text-xs text-muted-foreground">
          Seu jardim tem {poured} {poured === 1 ? "gota" : "gotas"}
          {toNext !== null
            ? `; faltam ${toNext} para uma nova planta.`
            : " e todas as plantas já apareceram."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
