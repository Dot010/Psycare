"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/input";
import type { DiaryEntry } from "@/features/diary/types";
import { MOODS } from "@/features/diary/utils";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const entrySchema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(120),
  mood: z.string().trim().min(2),
  content: z.string().trim().min(8, "Escreva um pouco mais sobre como se sente"),
  anxietyLevel: z.number().min(1).max(5),
});

interface EntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, o modal edita este registro; senão cria um novo. */
  entry?: DiaryEntry;
  onSave: (entry: DiaryEntry) => void;
}

export function EntryModal({ open, onOpenChange, entry, onSave }: EntryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-5 rounded-2xl p-6 sm:max-w-lg">
        <DialogTitle className="text-xl font-bold text-foreground">
          {entry ? "Editar registro" : "Novo registro no diário"}
        </DialogTitle>
        <EntryForm
          entry={entry}
          onCancel={() => onOpenChange(false)}
          onSave={onSave}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EntryForm({
  entry,
  onCancel,
  onSave,
  onDone,
}: {
  entry?: DiaryEntry;
  onCancel: () => void;
  onSave: (entry: DiaryEntry) => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [mood, setMood] = useState(entry?.mood ?? MOODS[0]);
  const [anxietyLevel, setAnxietyLevel] = useState(entry?.anxietyLevel ?? 2);
  const [content, setContent] = useState(entry?.content ?? "");
  const [discussInSession, setDiscussInSession] = useState(entry?.discussInSession ?? false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = entrySchema.safeParse({ title, mood, content, anxietyLevel });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    const today = toISODate(new Date());
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      date: entry?.date ?? today,
      editedAt: entry ? today : undefined,
      mood: parsed.data.mood,
      title: parsed.data.title,
      content: parsed.data.content,
      anxietyLevel: parsed.data.anxietyLevel,
      discussInSession,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="Título"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex: Reflexão sobre a semana de estudos"
      />

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Como você se sente?</legend>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mood === option}
              onClick={() => setMood(option)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                mood === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-sunken text-muted-foreground hover:bg-border",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
          <label htmlFor="anxiety-level">Nível de ansiedade ou carga</label>
          <span className="font-bold text-primary">{anxietyLevel} / 5</span>
        </div>
        <input
          id="anxiety-level"
          type="range"
          min={1}
          max={5}
          value={anxietyLevel}
          onChange={(e) => setAnxietyLevel(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-brand-600"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="entry-content" className="block text-xs font-medium text-muted-foreground">
          Suas anotações
        </label>
        <textarea
          id="entry-content"
          rows={4}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva livremente sobre seus pensamentos e o que disparou essa emoção..."
          className={fieldControlClass}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={discussInSession}
          onChange={(e) => setDiscussInSession(e.target.checked)}
          className="size-4 cursor-pointer accent-brand-600"
        />
        <span className="text-xs font-medium text-muted-foreground">
          Marcar para discutir na próxima consulta
        </span>
      </label>

      {error && (
        <p role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}

      <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{entry ? "Salvar alterações" : "Salvar registro"}</Button>
      </DialogFooter>
    </form>
  );
}
