"use client";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-surface border border-black/5 rounded-xl p-6 shadow-sm text-center space-y-3">
        <h2 className="text-2xl font-semibold text-ink">Algo saiu do esperado</h2>
        <p className="text-sm text-slate-600">Tivemos um erro temporário. Você pode tentar novamente sem perder seu progresso.</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-brand-800 text-white text-sm font-semibold hover:bg-brand-900 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
