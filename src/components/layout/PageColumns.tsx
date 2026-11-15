"use client";

import type { ReactNode } from "react";
import { Stagger } from "@/components/motion/Stagger";
import { cn } from "@/lib/utils";

interface PageColumnsProps {
  /** A coluna principal: o bloco de destaque e o que a pessoa faz na página. */
  children: ReactNode;
  /** A coluna estreita da direita: o que tem hora marcada ou é só para olhar. */
  aside?: ReactNode;
  className?: string;
}

/**
 * As duas colunas do Início, para todas as páginas: a principal e uma lateral de 19rem.
 * No celular a lateral desce para baixo da principal. Os blocos entram em cascata.
 */
export function PageColumns({ children, aside, className }: PageColumnsProps) {
  if (!aside) {
    return <Stagger className={cn("min-w-0 space-y-6", className)}>{children}</Stagger>;
  }
  return (
    <div className={cn("grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]", className)}>
      <Stagger className="min-w-0 space-y-6">{children}</Stagger>
      <Stagger className="min-w-0 space-y-5">{aside}</Stagger>
    </div>
  );
}
