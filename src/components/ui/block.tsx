import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * As cores de um bloco. "card" é o padrão; as outras são para o bloco de destaque de cada página
 * (um por página, para a cor ter significado).
 */
const TONES = {
  card: "border border-border bg-card text-foreground",
  /** Verde cheio, texto claro: o "Agora" do Meu dia. */
  brand: "bg-primary text-primary-foreground",
  /** Verde claro: Saúde. */
  leaf: "bg-brand-100 text-brand-ink",
  /** Verde bem claro com borda: Atividades. */
  soft: "border border-brand-200 bg-brand-50 text-foreground",
  /** Bege: Diário. */
  sand: "bg-sunken text-foreground",
  /** Amarelo da marca: próxima sessão. */
  sun: "bg-sun-300 text-ink",
  /** Amarelo claro: avisos e valores em aberto. */
  sunSoft: "border border-sun-100 bg-sun-50 text-foreground",
  /** Vermelho claro: ajuda em crise. */
  danger: "border-[1.5px] border-danger-300 bg-danger-50 text-foreground",
} as const;

export type BlockTone = keyof typeof TONES;

interface BlockProps {
  /** Título do bloco (vira o nome da seção para leitores de tela). */
  title?: ReactNode;
  /** Algo pequeno à direita do título: um número, um link, um selo. */
  aside?: ReactNode;
  tone?: BlockTone;
  /** "lg" para o bloco de destaque (título maior). */
  size?: "md" | "lg";
  className?: string;
  children?: ReactNode;
}

/** Um cartão do layout em blocos: canto grande, mesmo espaçamento em todo o app. */
export function Block({ title, aside, tone = "card", size = "md", className, children }: BlockProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "min-w-0 rounded-3xl",
        size === "lg" ? "p-6 md:p-7" : "p-5 md:p-6",
        TONES[tone],
        className,
      )}
    >
      {(title || aside) && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          {title && (
            <h2 id={titleId} className={size === "lg" ? "text-xl font-medium" : "text-base font-semibold"}>
              {title}
            </h2>
          )}
          {aside && <div className="text-sm opacity-80">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
