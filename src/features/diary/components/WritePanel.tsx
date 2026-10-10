"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import type { DiaryEntry } from "@/features/diary/types";
import { dailyPrompt, SUGGESTIONS, titleFromContent } from "@/features/diary/utils";
import { MoodPicker } from "@/features/mood/components/MoodPicker";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Escrever uma página: texto livre ou a partir de uma sugestão. */
export function WritePanel({ onSave }: { onSave: (entry: DiaryEntry) => void }) {
  const today = toISODate(new Date());
  const [prompt, setPrompt] = useState<string | undefined>();
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [anxietyLevel, setAnxietyLevel] = useState(2);
  const [content, setContent] = useState("");
  const [forSession, setForSession] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const suggestions = [dailyPrompt(today), ...SUGGESTIONS.filter((s) => s !== dailyPrompt(today))];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (text.length < 8) {
      setError("Escreva um pouco mais sobre como se sente");
      return;
    }
    setError("");
    onSave({
      id: crypto.randomUUID(),
      date: today,
      mood: MOOD_LABELS[moodLevel],
      moodLevel,
      title: titleFromContent(text),
      content: text,
      anxietyLevel,
      discussInSession: forSession,
      kind: "text",
      prompt,
    });
    setContent("");
    setPrompt(undefined);
    setForSession(false);
    setSaved(true);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <p id="diary-prompts" className="text-sm font-medium text-foreground">
          Não sabe por onde começar? Escolha uma sugestão, ou escreva do seu jeito.
        </p>
        <div role="group" aria-labelledby="diary-prompts" className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={prompt === s}
              onClick={() => setPrompt(prompt === s ? undefined : s)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-left text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                prompt === s
                  ? "border-brand-600 bg-brand-100 font-medium text-brand-ink"
                  : "border-border text-foreground hover:border-brand-600",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p id="diary-mood" className="mb-2 text-xs font-medium text-muted-foreground">
          Como você se sente? <span className="font-bold text-brand-accent">{MOOD_LABELS[moodLevel]}</span>
        </p>
        <MoodPicker value={moodLevel} onChange={setMoodLevel} labelledBy="diary-mood" />
      </div>

      <div className="space-y-1">
        <label htmlFor="diary-text" className="block text-sm font-medium text-foreground">
          {prompt ?? "Escreva do seu jeito"}
        </label>
        <textarea
          id="diary-text"
          rows={8}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSaved(false);
          }}
          placeholder="Uma frase já basta."
          className={fieldControlClass}
        />
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
          <label htmlFor="diary-anxiety">Nível de ansiedade ou carga</label>
          <span className="font-bold text-brand-accent">{anxietyLevel} / 5</span>
        </div>
        <input
          id="diary-anxiety"
          type="range"
          min={1}
          max={5}
          value={anxietyLevel}
          onChange={(e) => setAnxietyLevel(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-brand-600"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={forSession}
          onChange={(e) => setForSession(e.target.checked)}
          className="size-4 cursor-pointer accent-brand-600"
        />
        <span className="text-sm text-foreground">Marcar para a próxima consulta</span>
      </label>
      <p className="text-xs text-muted-foreground">
        O diário é só seu. Se marcar para a consulta, só o título da página é compartilhado, nunca o texto.
      </p>

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-brand-ink">Página guardada. Só você lê.</p>}
      <Button type="submit" className="min-h-11">
        Guardar página
      </Button>
    </form>
  );
}
