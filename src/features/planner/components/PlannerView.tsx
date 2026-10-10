"use client";

import { CalendarPlus, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { addDays } from "@/features/health/logic";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlanner } from "../hooks/usePlanner";
import {
  IMPORTANCE_LABEL,
  inbox,
  isFullDay,
  isLocked,
  monthWeeks,
  nextUp,
  openCount,
  overdue,
  tasksOn,
  toICS,
  upcoming,
} from "../logic";
import type { Task } from "../types";
import { TaskDialog } from "./TaskDialog";

type Tab = "hoje" | "lista" | "calendario";
const TABS: { id: Tab; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "lista", label: "Lista" },
  { id: "calendario", label: "Calendário" },
];

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const DOT: Record<Task["importance"], string> = {
  high: "bg-brand-ink",
  medium: "bg-brand-600",
  low: "bg-brand-300",
};

function dayLabel(iso: string, today: string): string {
  if (iso === today) return "Hoje";
  if (iso === addDays(today, 1)) return "Amanhã";
  if (iso === addDays(today, -1)) return "Ontem";
  return formatDateBR(iso).slice(0, 5);
}

export default function PlannerView() {
  const planner = usePlanner();
  const { today, tasks } = planner;
  const [tab, setTab] = useState<Tab>("hoje");
  const [editing, setEditing] = useState<Task | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<string | undefined>();

  const open = (task?: Task, date?: string) => {
    setEditing(task);
    setDialogDate(date);
    setDialogOpen(true);
  };

  const exportICS = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const blob = new Blob([toICS(tasks, stamp)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meu-dia.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  const row = (task: Task) => (
    <TaskRow
      key={task.id}
      task={task}
      today={today}
      onToggle={() => planner.toggleDone(task.id)}
      onEdit={() => open(task)}
      onDelete={isLocked(task) ? undefined : () => planner.deleteTask(task.id)}
      onPostpone={() => planner.postpone(task.id)}
    />
  );

  return (
    <Page
      title="Meu dia"
      description="Tudo o que você precisa fazer, num lugar só."
      width="narrow"
      actions={
        <>
          <Button variant="outline" onClick={exportICS}>
            <Download />
            Exportar .ics
          </Button>
          <Button onClick={() => open(undefined, today)}>
            <Plus />
            Nova tarefa
          </Button>
        </>
      }
    >
      <div role="tablist" aria-label="Visões do Meu dia" className="flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-11 rounded-full border px-5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
              tab === item.id
                ? "border-brand-600 bg-brand-100 font-medium text-brand-ink"
                : "border-border text-foreground hover:border-brand-600",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "hoje" && <TodayTab planner={planner} row={row} onAdd={() => open(undefined, today)} />}
      {tab === "lista" && <ListTab tasks={tasks} today={today} row={row} />}
      {tab === "calendario" && (
        <CalendarTab tasks={tasks} today={today} row={row} onAdd={(date) => open(undefined, date)} />
      )}

      <TaskDialog
        key={`${editing?.id ?? "new"}-${dialogOpen}-${dialogDate ?? ""}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        today={today}
        task={editing}
        defaultDate={dialogDate}
        onSave={planner.saveTask}
      />
    </Page>
  );
}

function TaskRow({
  task,
  today,
  onToggle,
  onEdit,
  onDelete,
  onPostpone,
}: {
  task: Task;
  today: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onPostpone: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-disabled={task.readonly || undefined}
        disabled={task.readonly}
        aria-label={`${task.done ? "Desmarcar" : "Marcar como feita"}: ${task.title}`}
        onClick={onToggle}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
          task.done ? "border-brand-600 bg-brand-600 text-white" : "border-brand-300",
        )}
      >
        {task.done ? "✓" : ""}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-base font-medium text-foreground",
            task.done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn("inline-block size-2 rounded-full", DOT[task.importance])} aria-hidden />
          Importância {IMPORTANCE_LABEL[task.importance].toLowerCase()}
          {task.time && <span>· {task.time}</span>}
          {task.date && task.date !== today && <span>· {dayLabel(task.date, today)}</span>}
          {task.source === "habito" ? (
            <span>· hábito de todo dia</span>
          ) : (
            task.source !== "free" && <span>· vem do seu cuidado</span>
          )}
          {task.readonly && <span>· marque a compra no card do remédio</span>}
        </p>
      </div>
      {task.href && !task.done && (
        <Link
          href={task.href}
          className="shrink-0 text-sm font-medium text-brand-ink underline focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
        >
          Abrir
        </Link>
      )}
      {!task.done && task.source !== "habito" && task.date && task.date <= today && (
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={onPostpone}
          aria-label={`Adiar sem culpa: ${task.title}`}
        >
          Adiar
        </Button>
      )}
      {task.source !== "habito" && (
        <ItemMenu label={`tarefa ${task.title}`} onEdit={onEdit} onDelete={onDelete} />
      )}
    </li>
  );
}

function TodayTab({
  planner,
  row,
  onAdd,
}: {
  planner: ReturnType<typeof usePlanner>;
  row: (task: Task) => React.ReactNode;
  onAdd: () => void;
}) {
  const { today, tasks, hardToday, setHardToday } = planner;
  const now = new Date().toTimeString().slice(0, 5);
  const todays = tasksOn(tasks, today);
  const shown = hardToday ? todays.filter((t) => t.importance === "high" || t.done) : todays;
  const next = nextUp(tasks, today, now);
  const late = overdue(tasks, today);

  return (
    <div className="space-y-6">
      {hardToday ? (
        <section className="space-y-2 rounded-2xl bg-sun-100 p-4">
          <p className="text-base font-medium text-ink">Tudo bem. Hoje basta o essencial.</p>
          <p className="text-sm text-ink">Estou mostrando só o que é de importância alta. O resto espera.</p>
          <Button variant="outline" className="min-h-11" onClick={() => setHardToday(false)}>
            Ver todas as tarefas
          </Button>
        </section>
      ) : (
        <Button variant="outline" className="min-h-11" onClick={() => setHardToday(true)}>
          Hoje foi difícil
        </Button>
      )}

      {isFullDay(tasks, today) && !hardToday && (
        <p role="status" className="rounded-xl bg-sun-100 px-4 py-3 text-sm text-ink">
          Seu dia está cheio. Que tal adiar uma ou duas tarefas, sem culpa?
        </p>
      )}

      {next && !hardToday && (
        <section aria-label="Agora" className="rounded-2xl bg-brand-100 p-4">
          <p className="text-sm text-brand-ink">Agora</p>
          <p className="text-lg font-semibold text-brand-ink">
            {next.title}
            {next.time && <span className="ml-2 text-base font-normal">às {next.time}</span>}
          </p>
        </section>
      )}

      {late.length > 0 && !hardToday && (
        <section aria-label="Atrasadas" className="space-y-2">
          <h2 className="text-lg font-semibold text-brand-ink">Ficou para trás</h2>
          <p className="text-sm text-muted-foreground">
            Sem pressão. Adie para amanhã ou conclua quando der.
          </p>
          <ul className="space-y-2">{late.map(row)}</ul>
        </section>
      )}

      <section aria-label="Tarefas de hoje" className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-ink">Hoje</h2>
        {shown.length === 0 ? (
          <div className="space-y-2">
            <p className="text-base text-muted-foreground">
              {hardToday ? "Nada essencial para hoje." : "Nada marcado para hoje."}
            </p>
            {!hardToday && (
              <Button variant="outline" className="min-h-11" onClick={onAdd}>
                Adicionar tarefa
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">{shown.map(row)}</ul>
        )}
      </section>
    </div>
  );
}

function ListTab({
  tasks,
  today,
  row,
}: {
  tasks: Task[];
  today: string;
  row: (task: Task) => React.ReactNode;
}) {
  const late = overdue(tasks, today);
  const free = inbox(tasks);
  const todays = tasksOn(tasks, today);
  const next = upcoming(tasks, today);
  return (
    <div className="space-y-6">
      {late.length > 0 && (
        <section aria-label="Ficou para trás" className="space-y-2">
          <h2 className="text-lg font-semibold text-brand-ink">Ficou para trás</h2>
          <ul className="space-y-2">{late.map(row)}</ul>
        </section>
      )}
      <section aria-label="Hoje" className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-ink">Hoje</h2>
        {todays.length ? (
          <ul className="space-y-2">{todays.map(row)}</ul>
        ) : (
          <p className="text-muted-foreground">Nada para hoje.</p>
        )}
      </section>
      {next.map(([date, list]) => (
        <section key={date} aria-label={dayLabel(date, today)} className="space-y-2">
          <h2 className="text-lg font-semibold text-brand-ink">{dayLabel(date, today)}</h2>
          <ul className="space-y-2">{list.map(row)}</ul>
        </section>
      ))}
      <section aria-label="Sem dia" className="space-y-2">
        <h2 className="text-lg font-semibold text-brand-ink">Sem dia</h2>
        <p className="text-sm text-muted-foreground">
          Ideias soltas. Quando souber o dia, escolha em &quot;Quando?&quot;.
        </p>
        {free.length ? (
          <ul className="space-y-2">{free.map(row)}</ul>
        ) : (
          <p className="text-muted-foreground">Nada solto por aqui.</p>
        )}
      </section>
    </div>
  );
}

function CalendarTab({
  tasks,
  today,
  row,
  onAdd,
}: {
  tasks: Task[];
  today: string;
  row: (task: Task) => React.ReactNode;
  onAdd: (date: string) => void;
}) {
  const start = new Date(today + "T00:00:00");
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const [selected, setSelected] = useState(today);
  const weeks = monthWeeks(view.year, view.month);
  const move = (delta: number) =>
    setView((current) => {
      const d = new Date(current.year, current.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const chosen = tasksOn(tasks, selected);

  return (
    <div className="space-y-6">
      <section aria-label="Calendário" className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => move(-1)}>
            <ChevronLeft />
          </Button>
          <h2 className="text-lg font-semibold text-brand-ink capitalize">
            {MONTHS[view.month]} de {view.year}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => move(1)}>
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground" aria-hidden>
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((date, i) => {
            if (!date) return <span key={i} />;
            const count = openCount(tasks, date);
            const full = isFullDay(tasks, date);
            return (
              <button
                key={date}
                type="button"
                aria-label={`${formatDateBR(date).slice(0, 5)}, ${count} ${count === 1 ? "tarefa aberta" : "tarefas abertas"}${full ? ", dia cheio" : ""}`}
                aria-pressed={selected === date}
                onClick={() => setSelected(date)}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-xl text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                  selected === date ? "bg-brand-600 text-white" : "hover:bg-sunken",
                  date === today && selected !== date && "border border-brand-600",
                )}
              >
                {Number(date.slice(8))}
                <span className="flex h-2 items-center gap-0.5" aria-hidden>
                  {count > 0 && (
                    <span className={cn("size-1.5 rounded-full", full ? "bg-sun-400" : "bg-brand-300")} />
                  )}
                  {count > 2 && <span className="size-1.5 rounded-full bg-brand-300" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label={`Tarefas de ${formatDateBR(selected)}`} className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-brand-ink">{dayLabel(selected, today)}</h2>
          <Button variant="outline" className="min-h-11" onClick={() => onAdd(selected)}>
            <CalendarPlus />
            Adicionar neste dia
          </Button>
        </div>
        {isFullDay(tasks, selected) && (
          <p role="status" className="rounded-xl bg-sun-100 px-4 py-3 text-sm text-ink">
            Este dia já está cheio. Considere outro dia para a próxima tarefa.
          </p>
        )}
        {chosen.length ? (
          <ul className="space-y-2">{chosen.map(row)}</ul>
        ) : (
          <p className="text-muted-foreground">Nada neste dia.</p>
        )}
      </section>
    </div>
  );
}
