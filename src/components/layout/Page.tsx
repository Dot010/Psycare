import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const WIDTHS = {
  narrow: "max-w-4xl",
  default: "max-w-5xl",
  /** A mesma largura do Início: as páginas em blocos usam esta. */
  wide: "max-w-6xl",
} as const;

interface PageProps {
  title: string;
  /** Linha pequena acima do título: a data, ou o nome da seção. */
  kicker?: ReactNode;
  description?: string;
  /** Botões ou ações principais da tela, alinhados à direita do título. */
  actions?: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
  /** Dentro de uma tela com abas: sem o espaçamento da página e com o título menor (h2). */
  embedded?: boolean;
  children: ReactNode;
}

/**
 * Estrutura comum das telas do dashboard: espaçamento, largura máxima e cabeçalho.
 * O título segue o Início: Poppins leve e grande, não negrito.
 */
export function Page({
  title,
  kicker,
  description,
  actions,
  width = "default",
  className,
  embedded = false,
  children,
}: PageProps) {
  if (embedded) {
    return (
      <div className={cn("space-y-6", className)}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-medium text-ink">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    );
  }
  return (
    <div className={cn("mx-auto w-full space-y-6 px-4 py-6 md:px-8 md:py-8", WIDTHS[width], className)}>
      <header className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          {kicker && (
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {kicker}
            </p>
          )}
          <h1 className="text-3xl leading-tight font-light tracking-tight break-words text-ink md:text-4xl">
            {title}
          </h1>
          {description && <p className="max-w-prose text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
