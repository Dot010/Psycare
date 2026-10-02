"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Habit } from "@/features/habits/types";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, SelectField } from "@/components/ui/field";

interface NewHabitModalProps {
  onAddHabit: (habit: Habit) => void;
}

const CATEGORIES = ["Saúde", "Estudo", "Trabalho", "Lazer"];

const habitSchema = z.object({
  title: z.string().trim().min(2, "Informe um nome válido"),
  category: z.string().trim().min(2, "Categoria inválida"),
});

export function NewHabitModal({ onAddHabit }: NewHabitModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Saúde");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = habitSchema.safeParse({ title, category });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Dados inválidos");
      return;
    }

    setError("");

    onAddHabit({
      id: crypto.randomUUID(),
      title: parsed.data.title,
      category: parsed.data.category,
      completedToday: false,
      streak: 0,
    });

    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo hábito
        </Button>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Criar novo hábito</DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Nome do hábito"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Meditar, ler, caminhar"
          />

          <SelectField
            label="Categoria"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((option) => (
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar hábito</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
