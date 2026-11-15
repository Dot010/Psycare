import { LifeBuoy, Phone, Wind } from "lucide-react";
import Link from "next/link";

const item =
  "flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-ink hover:border-brand-600 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

/**
 * Aparece quando a pessoa registra que está mal ou muito mal: acolhe e oferece três caminhos
 * curtos, sem alarmar. Com "muito mal", o telefone do CVV vem junto.
 */
export function HardMoment({ level }: { level: number }) {
  if (level > 2) return null;
  return (
    <section
      aria-label="Para um momento difícil"
      className="animate-rise space-y-3 rounded-2xl bg-sun-100 p-4 text-ink"
    >
      <p className="text-sm leading-relaxed">
        {level === 1
          ? "Sinto muito que hoje esteja tão pesado. Você não precisa passar por isso sem ajuda."
          : "Dia pesado. Tudo bem ir devagar hoje."}{" "}
        Se quiser, uma destas coisas pode ajudar agora:
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/breathing" className={item}>
          <Wind className="size-4" aria-hidden />
          Respirar um minuto
        </Link>
        <Link href="/dashboard/safety" className={item}>
          <LifeBuoy className="size-4" aria-hidden />
          Abrir meu plano de segurança
        </Link>
        {level === 1 && (
          <a href="tel:188" className={item}>
            <Phone className="size-4" aria-hidden />
            Ligar 188 (CVV, 24 h, gratuito)
          </a>
        )}
      </div>
    </section>
  );
}
