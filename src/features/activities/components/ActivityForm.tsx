"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ACTIVITIES, SLEEP_NIGHTS } from "../catalog";
import { MAX_NOTE, MAX_TEXT, validateAnswers } from "../logic";
import type { ActivityKind, Answers, FieldSpec } from "../types";

const controlClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

function Scale({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSpec, { type: "scale" }>;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  const options = Array.from({ length: field.max - field.min + 1 }, (_, i) => field.min + i);
  return (
    <div role="radiogroup" aria-label={field.label} className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "size-10 rounded-full border text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
            value === option
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-border bg-card text-foreground hover:border-brand-600",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Multi({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldSpec, { type: "multi" }>;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const full = value.length >= field.maxSelect;
  return (
    <div className="flex flex-wrap gap-2">
      {field.options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            disabled={!on && full}
            onClick={() => onChange(on ? value.filter((v) => v !== option) : [...value, option])}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none disabled:opacity-40",
              on
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border bg-card text-foreground hover:border-brand-600",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

interface ActivityFormProps {
  kind: ActivityKind;
  onCancel: () => void;
  onSave: (answers: Answers, note: string) => void;
}

export function ActivityForm({ kind, onCancel, onSave }: ActivityFormProps) {
  const info = ACTIVITIES[kind];
  const [values, setValues] = useState<Answers>({});
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (id: string, value: Answers[string]) => setValues((current) => ({ ...current, [id]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateAnswers(kind, values);
    setErrors(result.errors);
    if (result.ok) onSave(result.answers, note);
  };

  const sleepFields = kind === "sleep" ? info.fields.filter((f) => f.type === "hours") : [];
  const otherFields = info.fields.filter((f) => f.type !== "hours");

  return (
    <form onSubmit={submit} className="space-y-8" noValidate>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand-ink">{info.title}</h1>
        <p className="max-w-prose text-base text-foreground">{info.blurb}</p>
      </header>

      {sleepFields.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="sr-only">Horas dormidas por noite</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sleepFields.map((field, i) => (
              <label key={field.id} className="space-y-1 text-sm text-muted-foreground">
                Noite {i + 1}
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={16}
                  step={0.5}
                  aria-label={field.label}
                  value={typeof values[field.id] === "number" ? (values[field.id] as number) : ""}
                  onChange={(e) => set(field.id, e.target.value === "" ? undefined : Number(e.target.value))}
                  className={controlClass}
                />
              </label>
            ))}
          </div>
          {errors.n1 && (
            <p role="alert" className="text-sm text-danger-600">
              {errors.n1}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Até {SLEEP_NIGHTS} noites, em horas (ex.: 6,5).</p>
        </fieldset>
      )}

      {otherFields.map((field) => {
        const error = errors[field.id];
        const labelId = `f-${field.id}`;
        return (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={labelId}
              id={`${labelId}-label`}
              className="block text-base font-medium text-foreground"
            >
              {field.label}
            </label>
            {field.hint && <p className="text-sm text-muted-foreground">{field.hint}</p>}
            {field.type === "text" && (
              <input
                id={labelId}
                type="text"
                maxLength={MAX_TEXT}
                value={(values[field.id] as string) ?? ""}
                onChange={(e) => set(field.id, e.target.value)}
                aria-invalid={!!error}
                className={controlClass}
              />
            )}
            {field.type === "long" && (
              <textarea
                id={labelId}
                rows={3}
                maxLength={MAX_TEXT}
                value={(values[field.id] as string) ?? ""}
                onChange={(e) => set(field.id, e.target.value)}
                aria-invalid={!!error}
                className={controlClass}
              />
            )}
            {field.type === "scale" && (
              <Scale
                field={field}
                value={values[field.id] as number | undefined}
                onChange={(v) => set(field.id, v)}
              />
            )}
            {field.type === "multi" && (
              <Multi
                field={field}
                value={(values[field.id] as string[] | undefined) ?? []}
                onChange={(v) => set(field.id, v)}
              />
            )}
            {field.type === "multi" && (
              <p className="text-xs text-muted-foreground">Até {field.maxSelect}.</p>
            )}
            {error && (
              <p role="alert" className="text-sm text-danger-600">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <div className="space-y-2 border-t border-border pt-6">
        <label htmlFor="f-note" className="block text-base font-medium text-foreground">
          Uma anotação para o futuro <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="f-note"
          rows={2}
          maxLength={MAX_NOTE}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Como estava sua vida nessa época?"
          className={controlClass}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Voltar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
