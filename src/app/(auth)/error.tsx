"use client";

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#fdfcf9] border border-black/5 rounded-xl p-6 shadow-sm space-y-3 text-center">
        <h2 className="text-xl font-semibold text-[#2f3a32]">Erro na autenticação</h2>
        <p className="text-sm text-slate-600">Não conseguimos concluir esta etapa de acesso agora.</p>
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
