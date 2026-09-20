"use client";

import { useState } from "react";
import { useUser } from "@/context/page";

export default function OnboardingModal() {
  const { user, updateUser, isLoading } = useUser();
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  if (isLoading || user.isCustomUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    updateUser({
      name: nameInput.trim(),
      email: emailInput.trim() || "usuario@psycare.com.br",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            👋
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Boas-vindas ao <span className="text-emerald-600">Psycare</span>!
          </h2>
          <p className="text-slate-500 text-xs">
            Para personalizar sua experiência no painel, conte-nos como prefere ser chamado(a).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Seu Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: Maria Silva"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Seu E-mail (opcional)
            </label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
          >
            Acessar Meu Painel →
          </button>
        </form>
      </div>
    </div>
  );
}