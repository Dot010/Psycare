"use client";

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-black/5 rounded-xl p-6 shadow-sm space-y-3 text-center">
        <h2 className="text-xl font-semibold text-ink">Erro na autenticação</h2>
        <p className="text-sm text-slate-600">Não conseguimos concluir esta etapa de acesso agora.</p>
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
