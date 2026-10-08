import { Phone } from "lucide-react";

/** Os dois números de emergência, sempre no topo de qualquer tela de ajuda. */
export function EmergencyCalls() {
  return (
    <div className="space-y-3">
      <a
        href="tel:188"
        className="flex min-h-14 items-center justify-between gap-3 rounded-full bg-strong px-6 text-white transition-colors hover:bg-brand-900 focus-visible:ring-3 focus-visible:ring-sun-300 focus-visible:outline-none"
      >
        <span className="flex items-center gap-3 text-lg font-semibold">
          <Phone className="size-5" aria-hidden />
          Ligar 188
        </span>
        <span className="text-xs">CVV · 24 horas</span>
      </a>
      <a
        href="tel:192"
        className="flex min-h-12 items-center justify-between gap-3 rounded-full border-2 border-strong px-6 text-strong transition-colors hover:bg-sunken focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
      >
        <span className="flex items-center gap-3 text-base font-semibold">
          <Phone className="size-4" aria-hidden />
          Ligar 192
        </span>
        <span className="text-xs">SAMU · emergência</span>
      </a>
    </div>
  );
}
