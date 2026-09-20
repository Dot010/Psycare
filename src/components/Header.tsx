"use client";

import { useUser } from "@/context/page";
    
export default function Header() {
  const { user } = useUser();

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="w-full bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-sm font-bold text-slate-800">
          Olá, <span className="text-emerald-600">{user.name}</span>! 👋
        </h1>
        <p className="text-[11px] text-slate-400">
          Bem-vindo(a) de volta ao Psycare.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700">{user.name}</p>
          <p className="text-[10px] text-slate-400">{user.email}</p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          {initialLetter}
        </div>
      </div>
    </header>
  );
}