"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field, SelectField } from "@/components/ui/field";
import type { Habit } from "@/features/habits/types";

export const HABIT_CATEGORIES = ["Saúde", "Estudo", "Trabalho", "Lazer"];

const habitSchema = z.object({
  title: z.string().trim().min(2, "Informe um nome válido"),
  category: z.string().trim().min(2, "Categoria inválida"),
});

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, edita este hábito; senão cria um novo. */
  habit?: Habit;
  onSave: (habit: Habit) => void;
}

export function HabitModal({ open, onOpenChange, habit, onSave }: HabitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">
          {habit ? "Editar hábito" : "Criar novo hábito"}
        </DialogTitle>
        <HabitForm habit={habit} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function HabitForm({
  habit,
  onSave,
  onClose,
}: {
  habit?: Habit;
  onSave: (habit: Habit) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(habit?.title ?? "");
  const [category, setCategory] = useState(habit?.category ?? HABIT_CATEGORIES[0]);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = habitSchema.safeParse({ title, category });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    onSave({
      id: habit?.id ?? crypto.randomUUID(),
      streak: habit?.streak ?? 0,
      lastCompleted: habit?.lastCompleted,
      title: parsed.data.title,
      category: parsed.data.category,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nome do hábito"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex: Meditar, ler, caminhar"
      />

      <SelectField label="Categoria" required value={category} onChange={(e) => setCategory(e.target.value)}>
        {[...new Set([...HABIT_CATEGORIES, category])].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>

      {error && (
        <p role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}

      <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{habit ? "Salvar alterações" : "Salvar hábito"}</Button>
      </DialogFooter>
    </form>
  );
}
