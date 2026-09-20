"use client";

import { useState } from "react";
import Link from "next/link";
import { getMockUser } from "@/data/mockData";
import { useUser } from "@/context/page";

const HomePage = () => {
  const { user, updateUser } = useUser();


  const mockData = getMockUser(user?.name);
  const displayName = mockData.name;


  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);


  const completedHabits = mockData.habits.filter((h) => h.completedToday).length;
  const totalHabits = mockData.habits.length;
  const habitPercentage = Math.round((completedHabits / totalHabits) * 100);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateUser({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(displayName);
    setIsEditingName(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
  
      <div className="bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 md:p-8 rounded-3xl border border-emerald-100/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              {getGreeting()} 👋
            </span>

       
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                  className="px-3 py-1 text-xl font-bold text-slate-800 bg-white border border-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200/60 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-emerald-600">{displayName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(displayName);
                    setIsEditingName(true);
                  }}
                  title="Alterar seu nome"
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                >
                  ✏️
                </button>
              </h1>
            )}
          </div>

          <p className="text-slate-600 text-sm md:text-base">
            Seu espaço seguro para cuidar da mente e acompanhar sua evolução diária.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-4 w-2xl* feat/user-personalization rounded-2xl border border-slate-100 text-center min-w-40 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Sua Ofensiva
          </span>
          <span className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1 mt-1">
            🔥 5 Dias
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                📅 Próxima Sessão
              </span>
              <span className="text-xs text-slate-400 font-medium">Online</span>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-800">
                {mockData.nextSession.date}
              </p>
              <p className="text-sm font-semibold text-emerald-600 mt-0.5">
                às {mockData.nextSession.time}
              </p>
            </div>

            <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
              Consulta com{" "}
              <strong className="text-slate-700">
                {mockData.nextSession.doctor}
              </strong>
            </p>
          </div>

          <Link
            href="/dashboard/appointments"
            className="w-full py-2.5 bg-slate-900 text-center hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            Ver Consultas
          </Link>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                ⚡ Resumo de Hábitos
              </span>
              <span className="text-xs font-bold text-slate-600">
                {completedHabits}/{totalHabits}
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-800">
                {habitPercentage}% concluído
              </p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${habitPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {completedHabits === totalHabits
                ? "🎉 Parabéns! Todos os hábitos concluídos hoje."
                : `Faltam apenas ${totalHabits - completedHabits} hábito(s) para completar sua meta.`}
            </p>
          </div>

          <Link
            href="/dashboard/habits"
            className="w-full py-2.5 bg-emerald-50 text-center hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition border border-emerald-200/60"
          >
            Ver Meus Hábitos
          </Link>
        </div>

   
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                📖 Diário Emocional
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Seu espaço seguro
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Como você está se sentindo hoje?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Reserve alguns minutos para registrar suas emoções, pensamentos
                e acompanhar sua evolução diária.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/diary"
            className="w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-sm block"
          >
            Abrir Diário Emocional →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;