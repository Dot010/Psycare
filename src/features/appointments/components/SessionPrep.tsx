"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { useHealth } from "@/features/health/hooks/useHealth";
import { ConsultDialog } from "@/features/health/components/ConsultDialog";
import { addDays, buildConsultSummary } from "@/features/health/logic";
import { useMood } from "@/features/mood/hooks/useMood";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";
import { useLocalStorage } from "@/lib/useLocalStorage";

export const QUESTIONS_KEY = "psycare:session-questions:v1";
const NO_QUESTIONS: string[] = [];
const MAX_QUESTION = 200;

/** "Insônia (3 dias), cansaço (1 dia)": os sintomas da semana, do mais frequente ao menos. */
export function symptomWeek(list: { descricao: string; data: string }[], today: string): string[] {
  const since = addDays(today, -6);
  const days = new Map<string, Set<string>>();
  for (const s of list) {
    if (s.data < since || s.data > today) continue;
    const name = s.descricao.trim();
    days.set(name, (days.get(name) ?? new Set()).add(s.data));
  }
  return [...days.entries()]
    .sort((a, b) => b[1].size - a[1].size)
    .map(([name, set]) => `${name} (${set.size} ${set.size === 1 ? "dia" : "dias"})`);
}

/**
 * "Preparar a sessão": junta o que a pessoa já marcou no app para não chegar de mãos vazias.
 * Do diário vão só os títulos (o texto continua só dela); os sintomas vêm de Saúde; as perguntas ela escreve aqui.
 */
export function SessionPrep() {
  const { entries, saveEntry } = useDiary();
  const [questions, setQuestions] = useLocalStorage<string[]>(QUESTIONS_KEY, NO_QUESTIONS);
  const [draft, setDraft] = useState("");
  const today = toISODate(new Date());
  // O resumo que antes ficava em Saúde: remédios e doses, sintomas, humor e o que vai do diário.
  const health = useHealth();
  const { levels } = useMood();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const summary = summaryOpen
    ? buildConsultSummary({
        meds: health.remedios,
        taken: health.taken,
        sintomas: health.sintomas,
        moodByDay: levels,
        entries,
        today,
      })
    : [];

  const marked = entries.filter((e) => e.discussInSession).sort((a, b) => b.date.localeCompare(a.date));
  const symptoms = symptomWeek(health.sintomas, today);
  const total = marked.length + (symptoms.length ? 1 : 0) + questions.length;

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim().slice(0, MAX_QUESTION);
    if (!text) return;
    setQuestions((current) => [...current, text]);
    setDraft("");
  };

  return (
    <Block
      title="Preparar a sessão"
      size="lg"
      aside={
        <span className="rounded-full bg-brand-100 px-3 py-1 font-semibold text-brand-ink">
          {total === 1 ? "1 coisa para levar" : `${total} coisas para levar`}
        </span>
      }
    >
      <div className="space-y-6">
        <section aria-labelledby="prep-diario" className="space-y-2">
          <h3 id="prep-diario" className="text-sm font-semibold">
            Do seu diário
          </h3>
          {marked.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nada marcado. No Diário, marque &quot;para a próxima consulta&quot; numa página.
            </p>
          ) : (
            <ul className="space-y-2">
              {marked.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 rounded-2xl bg-canvas p-3 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">{formatDateBR(entry.date)}</span>
                    {entry.title}
                  </span>
                  <button
                    type="button"
                    aria-label={`Não levar: ${entry.title}`}
                    onClick={() => saveEntry({ ...entry, discussInSession: false })}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-sunken focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="prep-corpo" className="space-y-2">
          <h3 id="prep-corpo" className="text-sm font-semibold">
            Do seu corpo nesta semana
          </h3>
          <p className="rounded-2xl bg-canvas p-3 text-sm">
            {symptoms.length ? symptoms.join(", ") : "Nenhum sintoma anotado nos últimos 7 dias."}
          </p>
        </section>

        <section aria-labelledby="prep-perguntas" className="space-y-2">
          <h3 id="prep-perguntas" className="text-sm font-semibold">
            Suas perguntas
          </h3>
          {questions.length > 0 && (
            <ul className="space-y-2">
              {questions.map((question, index) => (
                <li
                  key={`${index}-${question}`}
                  className="animate-rise flex items-center gap-3 rounded-2xl border border-border p-3 text-sm"
                >
                  <span className="min-w-0 flex-1 break-words">{question}</span>
                  <button
                    type="button"
                    aria-label={`Tirar a pergunta: ${question}`}
                    onClick={() => setQuestions((current) => current.filter((_, i) => i !== index))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-sunken focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={add} className="flex gap-2">
            <label htmlFor="prep-pergunta" className="sr-only">
              Nova pergunta
            </label>
            <input
              id="prep-pergunta"
              value={draft}
              maxLength={MAX_QUESTION}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ex.: posso tomar o remédio de noite?"
              className={fieldControlClass}
            />
            <Button type="submit" className="shrink-0">
              Adicionar
            </Button>
          </form>
        </section>

        <Button variant="outline" onClick={() => setSummaryOpen(true)}>
          <FileText />
          Ver resumo para mostrar
        </Button>

        <p className="text-xs text-muted-foreground">
          Fica só neste aparelho. Do diário, só o título da página é mostrado ao profissional, nunca o texto.
        </p>
      </div>
      <ConsultDialog open={summaryOpen} onOpenChange={setSummaryOpen} lines={summary} />
    </Block>
  );
}
