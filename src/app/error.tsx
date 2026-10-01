"use client";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#fdfcf9] border border-black/5 rounded-xl p-6 shadow-sm text-center space-y-3">
        <h2 className="text-2xl font-semibold text-[#2f3a32]">Algo saiu do esperado</h2>
        <p className="text-sm text-slate-600">Tivemos um erro temporário. Você pode tentar novamente sem perder seu progresso.</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-900 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
