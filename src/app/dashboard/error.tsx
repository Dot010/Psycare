"use client";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="bg-[#fdfcf9] border border-black/5 rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-semibold text-[#2f3a32]">Não foi possível carregar o painel</h2>
        <p className="text-sm text-slate-600">Verifique sua conexão e tente recarregar esta área.</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-900 transition"
        >
          Recarregar painel
        </button>
      </div>
    </div>
  );
}
