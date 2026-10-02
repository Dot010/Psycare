"use client";


import { Page } from "@/components/layout/Page";
import { NewEntryModal } from "@/features/diary/components/NewEntryModal";
import type { DiaryEntry } from "@/features/diary/types";
import { mockUser } from "@/mocks/user";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function DiaryView() {
  const [entries, setEntries] = useLocalStorage<DiaryEntry[]>("psycare:diary",mockUser.diaryEntries);

  const addEntry = (entry: DiaryEntry) => setEntries((current) => [entry, ...current]);

  return (
    <Page
      title="Meu Diário Emocional"
      description="Registre como foi o seu dia e acompanhe sua evolução."
      actions={<NewEntryModal onAddEntry={addEntry} />}
    >
      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Nenhum registro ainda. Use &ldquo;Novo registro&rdquo; para escrever o primeiro.
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="space-y-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-400">{entry.date}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {entry.discussInSession && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      Para a próxima consulta
                    </span>
                  )}
                  {entry.anxietyLevel !== undefined && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Ansiedade {entry.anxietyLevel}/5
                    </span>
                  )}
                  <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {entry.mood}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-800">{entry.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{entry.content}</p>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
