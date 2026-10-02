import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const WIDTHS = {
  narrow: "max-w-4xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

interface PageProps {
  title: string;
  description?: string;
  /** Botões ou ações principais da tela, alinhados à direita do título. */
  actions?: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}

/** Estrutura comum das telas do dashboard: espaçamento, largura máxima e cabeçalho. */
export function Page({ title, description, actions, width = "default", className, children }: PageProps) {
  return (
    <div className={cn("mx-auto w-full space-y-8 p-4 md:p-8", WIDTHS[width], className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
