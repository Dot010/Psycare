"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/input";
import type { DiaryEntry } from "@/features/diary/types";
import { cn } from "@/lib/utils";

const MOODS = ["Calmo", "Ansioso", "Motivado", "Sobrecarregado", "Reflexivo"];

const entrySchema = z.object({
  title: z.string().trim().min(2, "Título muito curto").max(120),
  mood: z.string().trim().min(2),
  content: z.string().trim().min(8, "Escreva um pouco mais sobre como se sente"),
  anxietyLevel: z.number().min(1).max(5),
});

interface NewEntryModalProps {
  onAddEntry: (entry: DiaryEntry) => void;
}

export function NewEntryModal({ onAddEntry }: NewEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [anxietyLevel, setAnxietyLevel] = useState(2);
  const [content, setContent] = useState("");
  const [discussInSession, setDiscussInSession] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setMood(MOODS[0]);
    setAnxietyLevel(2);
    setContent("");
    setDiscussInSession(false);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = entrySchema.safeParse({ title, mood, content, anxietyLevel });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    onAddEntry({
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
      mood: parsed.data.mood,
      title: parsed.data.title,
      content: parsed.data.content,
      anxietyLevel: parsed.data.anxietyLevel,
      discussInSession,
    });

    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo registro
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="gap-5 rounded-2xl p-6 sm:max-w-lg">
        <DialogTitle className="text-xl font-bold text-slate-800">Novo registro no diário</DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label="Título"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reflexão sobre a semana de estudos"
          />

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-slate-600">Como você se sente?</legend>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mood === option}
                  onClick={() => setMood(option)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    mood === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-600">
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
              className="h-2 w-full cursor-pointer accent-brand-800"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="entry-content" className="block text-xs font-medium text-slate-600">
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
              className="size-4 cursor-pointer accent-brand-800"
            />
            <span className="text-xs font-medium text-slate-600">Marcar para discutir na próxima consulta</span>
          </label>

          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}

          <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar registro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
