"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/input";
import type { DiaryEntry } from "@/features/diary/types";
import { dailyPrompt, titleFromContent } from "@/features/diary/utils";
import { MoodPicker } from "@/features/mood/components/MoodPicker";
import { entryLevel, MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { toISODate } from "@/lib/dates";

const entrySchema = z.object({
  title: z.string().trim().max(120),
  moodLevel: z.number().int().min(1).max(5),
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
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[94dvh] gap-5 overflow-y-auto rounded-2xl p-6 sm:max-w-xl"
      >
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
  const [moodLevel, setMoodLevel] = useState<MoodLevel>((entry && entryLevel(entry)) ?? 3);
  const [anxietyLevel, setAnxietyLevel] = useState(entry?.anxietyLevel ?? 2);
  const [content, setContent] = useState(entry?.content ?? "");
  const [discussInSession, setDiscussInSession] = useState(entry?.discussInSession ?? false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = entrySchema.safeParse({ title, moodLevel, content, anxietyLevel });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    const today = toISODate(new Date());
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      date: entry?.date ?? today,
      editedAt: entry ? today : undefined,
      mood: MOOD_LABELS[parsed.data.moodLevel as MoodLevel],
      moodLevel: parsed.data.moodLevel as MoodLevel,
      title: parsed.data.title || titleFromContent(parsed.data.content),
      content: parsed.data.content,
      anxietyLevel: parsed.data.anxietyLevel,
      discussInSession,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="Título (se quiser)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Se ficar em branco, uso o começo do texto"
      />

      <div>
        <p id="entry-mood" className="mb-2 text-xs font-medium text-muted-foreground">
          Como você se sente? <span className="font-bold text-brand-accent">{MOOD_LABELS[moodLevel]}</span>
        </p>
        <MoodPicker value={moodLevel} onChange={setMoodLevel} labelledBy="entry-mood" />
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
          <label htmlFor="anxiety-level">Nível de ansiedade ou carga</label>
          <span className="font-bold text-brand-accent">{anxietyLevel} / 5</span>
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
          O que você quer escrever?
        </label>
        <textarea
          id="entry-content"
          rows={7}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={entry ? undefined : dailyPrompt(toISODate(new Date()))}
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
