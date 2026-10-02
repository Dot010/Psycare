"use client";

import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { NewEntryModal } from "@/features/diary/components/NewEntryModal";
import type { DiaryEntry } from "@/features/diary/types";
import { mockUser } from "@/mocks/user";

export default function DiaryView() {
  const [entries, setEntries] = useState<DiaryEntry[]>(mockUser.diaryEntries);

  const addEntry = (entry: DiaryEntry) => setEntries((current) => [entry, ...current]);

  return (
    <Page
      title="Meu Diário Emocional"
      description="Registre como foi o seu dia e acompanhe sua evolução."
      actions={<NewEntryModal onAddEntry={addEntry} />}
    >
      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum registro ainda. Use &ldquo;Novo registro&rdquo; para escrever o primeiro.
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id} className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">{entry.date}</span>
                <div className="flex flex-wrap items-center gap-2">
                  {entry.discussInSession && (
                    <span className="rounded-full bg-sun-50 px-3 py-1 text-xs font-semibold text-ink">
                      Para a próxima consulta
                    </span>
                  )}
                  {entry.anxietyLevel !== undefined && (
                    <span className="rounded-full bg-sunken px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Ansiedade {entry.anxietyLevel}/5
                    </span>
                  )}
                  <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {entry.mood}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-foreground">{entry.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
