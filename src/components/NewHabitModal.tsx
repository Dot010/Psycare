"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Habit } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewHabitModalProps {
  onAddHabit: (habit: Habit) => void;
}

export function NewHabitModal({ onAddHabit }: NewHabitModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Saude");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      id: Date.now().toString(),
      title,
      category,
      completedToday: false,
      streak: 0,
      description: undefined,
      name: undefined
    });

    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Novo Hábito
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Criar Novo Hábito</DialogTitle>
        </DialogHeader>

        <form
          id="habit-form"
          onSubmit={handleSubmit}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Nome do Hábito
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="EX: Meditar, Ler, Exercícios"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Categoria
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none
              focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Saude">Saúde</option>
              <option value="Estudo">Estudo</option>
              <option value="Trabalho">Trabalho</option>
              <option value="Lazer">Lazer</option>
            </select>
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen (false)}
            >
          Cancelar
                      </Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Salvar Hábito
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
