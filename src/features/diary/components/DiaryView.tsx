"use client";

import Link from "next/link";
import { useState } from "react";
import { BookCover } from "@/features/diary/components/BookCover";
import { DrawPanel } from "@/features/diary/components/DrawPanel";
import { PagesPanel } from "@/features/diary/components/PagesPanel";
import { WeekPanel } from "@/features/diary/components/WeekPanel";
import { WritePanel } from "@/features/diary/components/WritePanel";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { writtenDays } from "@/features/diary/utils";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Tab = "escrever" | "semana" | "desenho" | "paginas";

const TABS: { id: Tab; label: string }[] = [
  { id: "escrever", label: "Escrever" },
  { id: "semana", label: "Semana" },
  { id: "desenho", label: "Desenho" },
  { id: "paginas", label: "Páginas" },
];

function writingSentence(days: number): string {
  if (days === 0) return "Quando você quiser, é só começar. Uma frase já basta.";
  if (days === 1) return "Você escreveu em 1 dia da última semana.";
  return `Você escreveu em ${days} dias da última semana.`;
}

export default function DiaryView() {
  const { entries, saveEntry, deleteEntry } = useDiary();
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<Tab>("escrever");
  const today = toISODate(new Date());

  return (
    <div className="bg-linear-to-b from-brand-100/70 to-transparent">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <header className="space-y-3">
          <p className="text-xs font-medium tracking-widest text-brand-accent uppercase">Diário</p>
          <h1 className="text-4xl leading-tight font-semibold text-ink">Meu diário</h1>
          <p className="max-w-md text-lg leading-snug text-foreground">
            {writingSentence(writtenDays(entries, today))}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
            <Link
              href="/dashboard/mood"
              className="text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
            >
              Ver meu humor
            </Link>
            <Link
              href="/dashboard/diary/activities"
              className="text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
            >
              Atividades
            </Link>
          </div>
        </header>

        <BookCover
          title="Meu diário"
          subtitle="Só você lê"
          opened={opened}
          onOpen={() => setOpened((value) => !value)}
        />

        {opened && (
          <section aria-label="Páginas do diário" className="space-y-6">
            <div role="tablist" aria-label="Seções do diário" className="flex flex-wrap gap-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`diario-tab-${item.id}`}
                  aria-selected={tab === item.id}
                  aria-controls={`diario-panel-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "h-10 rounded-full border px-4 text-sm font-semibold transition-colors",
                    tab === item.id
                      ? "border-brand-ink bg-brand-ink text-white"
                      : "border-input bg-card text-muted-foreground hover:bg-sunken",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`diario-panel-${tab}`} aria-labelledby={`diario-tab-${tab}`}>
              {tab === "escrever" && <WritePanel onSave={saveEntry} />}
              {tab === "semana" && <WeekPanel entries={entries} />}
              {tab === "desenho" && <DrawPanel onSave={saveEntry} />}
              {tab === "paginas" && (
                <PagesPanel entries={entries} today={today} onSave={saveEntry} onDelete={deleteEntry} />
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
