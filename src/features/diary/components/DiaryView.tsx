"use client";

import { NotebookPen, Plus, Search, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { EntryModal } from "@/features/diary/components/EntryModal";
import { useDiary } from "@/features/diary/hooks/useDiary";
import type { DiaryEntry } from "@/features/diary/types";
import { dayHeading, filterEntries, groupByDay, MOODS, writtenDays } from "@/features/diary/utils";
import { MoodFace } from "@/features/mood/components/MoodFace";
import { entryLevel } from "@/features/mood/logic";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLLAPSED_LENGTH = 220;

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DiaryEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.content.length > COLLAPSED_LENGTH;
  const level = entryLevel(entry);

  const meta = [
    entry.anxietyLevel !== undefined ? `Ansiedade ${entry.anxietyLevel}/5` : null,
    entry.editedAt ? `editado em ${formatDateBR(entry.editedAt)}` : null,
  ].filter(Boolean);

  return (
    <li className="flex gap-4 border-t border-border py-5">
      <div className="flex w-10 shrink-0 flex-col items-center gap-1 pt-0.5">
        {level !== undefined ? (
          <MoodFace level={level} size={40} labelled />
        ) : (
          <span aria-hidden className="size-10 rounded-full bg-sunken" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug font-semibold text-foreground">{entry.title}</h3>
          <ItemMenu label={`registro "${entry.title}"`} onEdit={onEdit} onDelete={onDelete} />
        </div>

        <p className="text-xs font-medium text-brand-ink">
          {entry.mood}
          {meta.length > 0 && (
            <span className="font-normal text-muted-foreground"> · {meta.join(" · ")}</span>
          )}
          {entry.discussInSession && (
            <span className="ml-2 inline-flex items-center gap-1 font-semibold text-sun-700">
              <Star className="size-3 fill-current" aria-hidden />
              Para a consulta
            </span>
          )}
        </p>

        <p className="text-base leading-relaxed text-foreground/90">
          {isLong && !expanded ? `${entry.content.slice(0, COLLAPSED_LENGTH).trimEnd()}…` : entry.content}
        </p>
        {isLong && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="text-sm font-semibold text-brand-ink hover:underline"
          >
            {expanded ? "Mostrar menos" : "Ler mais"}
          </button>
        )}
      </div>
    </li>
  );
}

function writingSentence(days: number): string {
  if (days === 0) return "Quando você quiser, é só começar. Uma frase já basta.";
  if (days === 1) return "Você escreveu em 1 dia da última semana.";
  return `Você escreveu em ${days} dias da última semana.`;
}

export default function DiaryView() {
  const { entries, saveEntry, deleteEntry } = useDiary();
  const [editing, setEditing] = useState<DiaryEntry | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("");
  const [onlyForSession, setOnlyForSession] = useState(false);

  const today = toISODate(new Date());
  const visible = filterEntries(entries, { query, mood, onlyForSession });
  const groups = groupByDay(visible);
  const hasFilters = query !== "" || mood !== "" || onlyForSession;

  const openNew = () => {
    setEditing(undefined);
    setModalOpen(true);
  };
  const openEdit = (entry: DiaryEntry) => {
    setEditing(entry);
    setModalOpen(true);
  };

  return (
    <div className="bg-linear-to-b from-brand-100/70 to-transparent">
      <div className="mx-auto w-full max-w-2xl space-y-10 px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <header className="space-y-3">
          <p className="text-xs font-medium tracking-widest text-brand-accent uppercase">Diário</p>
          <h1 className="text-4xl leading-tight font-semibold text-ink">Meu diário</h1>
          <p className="max-w-md text-lg leading-snug text-foreground">
            {writingSentence(writtenDays(entries, today))}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <Button onClick={openNew}>
              <Plus />
              Novo registro
            </Button>
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

        {entries.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-52 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                aria-label="Buscar no diário"
                placeholder="Buscar no diário"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(fieldControlClass, "h-10 rounded-full pl-9")}
              />
            </div>
            <select
              aria-label="Filtrar por humor"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className={cn(fieldControlClass, "h-10 w-auto rounded-full")}
            >
              <option value="">Todos os humores</option>
              {MOODS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-pressed={onlyForSession}
              onClick={() => setOnlyForSession((value) => !value)}
              className={cn(
                "h-10 rounded-full border px-4 text-xs font-semibold transition-colors",
                onlyForSession
                  ? "border-sun-300 bg-sun-100 text-ink"
                  : "border-input bg-card text-muted-foreground hover:bg-sunken",
              )}
            >
              Para a consulta
            </button>
          </div>
        )}

        {entries.length === 0 ? (
          <EmptyState
            title="Seu diário está em branco"
            description="Uma frase já basta para começar. Escrever ajuda a perceber como você está ao longo dos dias."
            action={
              <Button onClick={openNew}>
                <NotebookPen />
                Escrever o primeiro registro
              </Button>
            }
          />
        ) : groups.length === 0 && hasFilters ? (
          <EmptyState
            title="Nada encontrado"
            description="Nenhum registro combina com a busca ou os filtros escolhidos."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setMood("");
                  setOnlyForSession(false);
                }}
              >
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.date} aria-label={dayHeading(group.date, today)}>
                <h2 className="mb-1 text-xl font-semibold text-brand-ink">{dayHeading(group.date, today)}</h2>
                <ul>
                  {group.entries.map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      onEdit={() => openEdit(entry)}
                      onDelete={() => deleteEntry(entry.id)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <EntryModal open={modalOpen} onOpenChange={setModalOpen} entry={editing} onSave={saveEntry} />
      </div>
    </div>
  );
}
