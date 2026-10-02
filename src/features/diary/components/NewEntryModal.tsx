"use client";

import { useState } from "react";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { DiaryEntry } from "@/types/domain";
const moods = ["Calmo", "Ansioso", "Motivado", "Sobrecarregado", "Reflexivo"];

interface NewEntryModalProps { 
    onAddEntry: (entry: DiaryEntry) => void;
}

const entrySchema = z.object({
    title: z.string().trim().min(2, "Título muito curto").max(120),
    mood: z.string().trim().min(2),
    content: z.string().trim().min(8, "Escreva um pouco mais sobre como se sente"),
    anxietyLevel: z.number().min(1).max(5),
});

export function NewEntryModal({ onAddEntry }: NewEntryModalProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedMood, setSelectedMood] = useState("Calmo");
    const [anxietyLevel, setAnxietyLevel] = useState(2);
    const [content, setContent] = useState("");
        const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
                const parsed = entrySchema.safeParse({
                    title,
                    mood: selectedMood,
                    content,
                    anxietyLevel,
                });

                if (!parsed.success) {
                    setError(parsed.error.issues[0]?.message || "Dados inválidos");
                    return;
                }

                setError("");
      
        const newEntry: DiaryEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",

            }),
            mood: parsed.data.mood,
            title: parsed.data.title,
            content: parsed.data.content,
        };
        onAddEntry(newEntry)
        
        setTitle("");
        setContent("");
        setSelectedMood("Calmo")
        setAnxietyLevel(2)


        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 transition shadow-sm self-start sm:self-auto cursor-pointer">
                    + Novo Registro
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-125 rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        Novo Registro no Diário
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Título */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                            Título da Reflexão
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="Ex: Reflexão sobre a semana de estudos"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                        />
                    </div>

                    {/* Estado Emocional */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                            Como você se sente?
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {moods.map((mood) => (
                                <button
                                    type="button"
                                    key={mood}
                                    onClick={() => setSelectedMood(mood)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${selectedMood === mood
                                            ? "bg-brand-600 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nível de Ansiedade */}
                    <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                            <span>Nível de Ansiedade / Carga</span>
                            <span className="text-brand-600 font-bold">
                                {anxietyLevel} / 5
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={anxietyLevel}
                            onChange={(e) => setAnxietyLevel(Number(e.target.value))}
                            className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                        />
                    </div>

                    {/* Conteúdo Livre */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                            Suas Anotações
                        </label>
                        <textarea
                            rows={4}
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Escreva livremente sobre seus pensamentos e o que disparou essa emoção..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none transition"
                        />
                    </div>

                    {/* Checkbox para a Terapia */}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            className="rounded accent-brand-600 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 font-medium">
                            Marcar para discutir na próxima consulta
                        </span>
                    </label>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    {/* Ações */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition shadow-sm cursor-pointer"
                        >
                            Salvar Registro
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
