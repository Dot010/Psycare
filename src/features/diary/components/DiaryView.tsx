"use client";

import { NotebookPen, Plus, Search } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { EntryModal } from "@/features/diary/components/EntryModal";
import { MoodChart } from "@/features/diary/components/MoodChart";
import { useDiary } from "@/features/diary/hooks/useDiary";
import type { DiaryEntry } from "@/features/diary/types";
import { anxietyColor, dayHeading, filterEntries, groupByDay, MOODS } from "@/features/diary/utils";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLLAPSED_LENGTH = 220;

function EntryCard({
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

  return (
    <li
      className="relative space-y-2 rounded-2xl border border-border bg-card py-5 pr-4 pl-6 shadow-sm"
      style={{ ["--bar" as string]: anxietyColor(entry.anxietyLevel) }}
    >
      <span aria-hidden className="absolute inset-y-3 left-0 w-1.5 rounded-r-full bg-(--bar)" />

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
        <ItemMenu label={`registro "${entry.title}"`} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 font-semibold text-brand-ink">
          {entry.mood}
        </span>
        {entry.anxietyLevel !== undefined && (
          <span className="rounded-full bg-sunken px-3 py-1 font-semibold text-muted-foreground">
            Ansiedade {entry.anxietyLevel}/5
          </span>
        )}
        {entry.discussInSession && (
          <span className="rounded-full bg-sun-100 px-3 py-1 font-semibold text-ink">
            Para a próxima consulta
          </span>
        )}
        {entry.editedAt && (
          <span className="text-muted-foreground">editado em {formatDateBR(entry.editedAt)}</span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {isLong && !expanded ? `${entry.content.slice(0, COLLAPSED_LENGTH).trimEnd()}…` : entry.content}
      </p>
      {isLong && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="text-xs font-semibold text-brand-ink hover:underline"
        >
          {expanded ? "Mostrar menos" : "Ler mais"}
        </button>
      )}
    </li>
  );
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
    <Page
      title="Meu Diário Emocional"
      description="Registre como foi o seu dia e acompanhe sua evolução."
      actions={
        <Button onClick={openNew}>
          <Plus />
          Novo registro
        </Button>
      }
    >
      <MoodChart entries={entries} today={today} />

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
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.date} aria-label={dayHeading(group.date, today)} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{dayHeading(group.date, today)}</h2>
              <ul className="space-y-3">
                {group.entries.map((entry) => (
                  <EntryCard
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
    </Page>
  );
}
