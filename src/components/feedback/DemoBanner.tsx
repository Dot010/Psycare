import { isDemoMode } from "@/lib/demo";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div
      role="status"
      className="w-full bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900"
    >
      Versão de demonstração: não insira dados reais (pessoais, de saúde ou de pagamento).
    </div>
  );
}
