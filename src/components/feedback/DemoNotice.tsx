import { FlaskConical } from "lucide-react";
import type { ReactNode } from "react";

/** Faixa que avisa que uma parte do app é demonstração (nada acontece de verdade). */
export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-lg bg-sun-100 px-3 py-2 text-sm leading-snug text-ink"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Demonstração. </strong>
        {children}
      </span>
    </p>
  );
}
