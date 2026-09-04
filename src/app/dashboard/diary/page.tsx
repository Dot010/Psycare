"use client"; // 1. Necessário para usar hooks como useState no Next.js

import { useState } from "react";
import { DiaryEntry, mockUser } from "@/data/mockData";
import { NewEntryModal } from "@/components/NewEntryModal";

const DiaryPage = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>(
    mockUser.diaryEntries || []
  );

  const addEntry = (newEntry: DiaryEntry) => {
    setEntries((prevEntries) => [newEntry, ...prevEntries]);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Cabecalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Meu Diario Emocional
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Registre como foi o seu dia, seus pensamentos e acompanhe sua evolução.
          </p>
        </div>

        <NewEntryModal onAddEntry={addEntry} />
      </div>

      {/* Listagem usando o estado reativo "entries" */}
      <div className="space-y-4">
        {entries.map((entry) => ( // 2. Mudado de mockUser.diaryEntries para entries
          <article
            key={entry.id}
            className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-400">
                {entry.date}
              </span>
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                {entry.mood}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              {entry.title}
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              {entry.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default DiaryPage;