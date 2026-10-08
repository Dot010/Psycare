"use client";

import { useState } from "react";
import { MAX_TAG_LENGTH, MOOD_TAGS, normalizeTag, toggleTag } from "@/features/mood/logic";
import { cn } from "@/lib/utils";

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

const chip =
  "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none";

/** O que influenciou o dia: tags prontas, mais a possibilidade de escrever a sua ("Outro…"). */
export function TagPicker({ value, onChange }: TagPickerProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const custom = value.filter((tag) => !MOOD_TAGS.includes(tag));

  const addCustom = () => {
    const tag = normalizeTag(draft);
    if (tag && !value.includes(tag)) onChange(toggleTag(value, tag));
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[...MOOD_TAGS, ...custom].map((tag) => {
          const active = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(toggleTag(value, tag))}
              className={cn(
                chip,
                active
                  ? "border-brand-600 bg-brand-100 text-brand-ink"
                  : "border-input bg-card text-foreground hover:border-brand-600",
              )}
            >
              {tag}
            </button>
          );
        })}
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={cn(
              chip,
              "border-dashed border-input bg-transparent text-muted-foreground hover:border-brand-600",
            )}
          >
            Outro…
          </button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCustom();
          }}
          className="flex gap-2"
        >
          <label htmlFor="custom-tag" className="sr-only">
            Escreva o que influenciou
          </label>
          <input
            id="custom-tag"
            autoFocus
            value={draft}
            maxLength={MAX_TAG_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex.: prova"
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-brand-700"
          >
            Adicionar
          </button>
        </form>
      )}
    </div>
  );
}
