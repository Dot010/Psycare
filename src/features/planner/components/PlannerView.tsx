"use client";

import { CalendarPlus, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { TabPanel, UnderlineTabs } from "@/components/ui/underline-tabs";
import { addDays } from "@/features/health/logic";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { HabitsPanel } from "@/features/habits/components/HabitsPanel";
import { usePlanner } from "../hooks/usePlanner";
import {
  byPeriod,
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
} from "../logic";
import type { Task } from "../types";
import { FocusNow } from "./FocusNow";
import { TaskDialog } from "./TaskDialog";

type Tab = "hoje" | "calendario" | "habitos";
const TABS: { id: Tab; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "calendario", label: "Calendário" },
  { id: "habitos", label: "Hábitos" },
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
  const [tab, setTab] = useState<Tab>(useSearchParams()?.get("aba") === "habitos" ? "habitos" : "hoje");
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
      kicker={new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
      description="Uma coisa de cada vez. O resto pode esperar."
      width="wide"
      actions={
        <Button onClick={() => open(undefined, today)}>
          <Plus />
          Nova tarefa
        </Button>
      }
    >
      <UnderlineTabs label="Visões do Meu dia" tabs={TABS} value={tab} onChange={setTab} />

      <TabPanel key={tab} label={TABS.find((t) => t.id === tab)!.label}>
        {tab === "hoje" && <TodayTab planner={planner} row={row} onAdd={() => open(undefined, today)} />}
        {tab === "habitos" && (
          <Block>
            <HabitsPanel />
          </Block>
        )}
        {tab === "calendario" && (
          <>
            <CalendarTab tasks={tasks} today={today} row={row} onAdd={(date) => open(undefined, date)} />
            {/* Levar as tarefas para a agenda do celular: fica junto do calendário, não no topo da página. */}
            <Button variant="outline" onClick={exportICS} className="mt-4">
              <Download />
              Levar para a agenda do celular
            </Button>
          </>
        )}
      </TabPanel>

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
    <li className="flex min-h-14 items-center gap-3 border-t border-sunken py-2 first:border-t-0">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-disabled={task.readonly || undefined}
        disabled={task.readonly}
        aria-label={`${task.done ? "Desmarcar" : "Marcar como feita"}: ${task.title}`}
        onClick={onToggle}
        className={cn(
          "flex size-8 pointer-coarse:size-11 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
          task.done ? "animate-pop border-brand-600 bg-brand-600 text-white" : "border-brand-400",
        )}
      >
        {task.done ? "✓" : ""}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-base break-words text-foreground",
            task.done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("inline-block size-2 rounded-full", DOT[task.importance])} aria-hidden />
            <span className="sr-only">Importância {IMPORTANCE_LABEL[task.importance].toLowerCase()}</span>
            <span aria-hidden>{IMPORTANCE_LABEL[task.importance]}</span>
          </span>
          {task.time && <span className="tabular-nums">· {task.time}</span>}
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
          className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-brand-ink underline focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
        >
          Abrir
        </Link>
      )}
      {!task.done && task.source !== "habito" && task.date && task.date <= today && (
        <Button
          variant="ghost"
          className="min-h-11 px-2"
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
  const { today, tasks, hardToday, setHardToday, toggleDone } = planner;
  const now = new Date().toTimeString().slice(0, 5);
  const todays = tasksOn(tasks, today);
  const shown = hardToday ? todays.filter((t) => t.importance === "high" || t.done) : todays;
  const next = nextUp(tasks, today, now);
  const late = overdue(tasks, today);
  const done = shown.filter((t) => t.done).length;

  return (
    <PageColumns
      aside={
        <>
          <Block label="Progresso de hoje">
            <div className="flex items-center gap-4">
              <ProgressRing
                value={shown.length ? done / shown.length : 0}
                label={`${done} de ${shown.length} feitas hoje`}
              >
                <span className="text-xl font-semibold">
                  <CountUp value={done} />/{shown.length}
                </span>
              </ProgressRing>
              <div className="space-y-1">
                <p className="text-base font-semibold">
                  {shown.length > 0 && done === shown.length
                    ? "Tudo feito hoje"
                    : `${done} de ${shown.length} feitas`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cada tarefa feita vira uma gota para o seu jardim.
                </p>
              </div>
            </div>
          </Block>

          <Block
            tone="sunSoft"
            title={hardToday ? "Tudo bem. Hoje basta o essencial." : "Hoje está difícil?"}
          >
            <p className="mb-4 text-sm leading-relaxed">
              {hardToday
                ? "Estou mostrando só o que é de importância alta. O resto espera."
                : "Deixo na lista só o essencial. O resto vai para amanhã, sem culpa."}
            </p>
            <Button variant="outline" className="min-h-11" onClick={() => setHardToday(!hardToday)}>
              {hardToday ? "Ver todas as tarefas" : "Hoje foi difícil"}
            </Button>
          </Block>
        </>
      }
    >
      {next && !hardToday && <FocusNow key={next.id} task={next} onDone={() => toggleDone(next.id)} />}

      {isFullDay(tasks, today) && !hardToday && (
        <p role="status" className="rounded-2xl bg-sun-100 px-4 py-3 text-sm text-ink">
          Seu dia está cheio. Que tal adiar uma ou duas tarefas, sem culpa?
        </p>
      )}

      {late.length > 0 && !hardToday && (
        <Block label="Atrasadas" title="Ficou para trás">
          <p className="-mt-2 mb-2 text-sm text-muted-foreground">
            Sem pressão. Adie para amanhã ou conclua quando der.
          </p>
          <ul>{late.map(row)}</ul>
        </Block>
      )}

      <Block label="Tarefas de hoje" title="Hoje" size="lg">
        {shown.length === 0 ? (
          <div className="space-y-3">
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
          <div className="space-y-2">
            {byPeriod(shown).map(([period, list]) => (
              <div key={period}>
                <p className="pt-2 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {period}
                </p>
                <ul>{list.map(row)}</ul>
              </div>
            ))}
          </div>
        )}
      </Block>
    </PageColumns>
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
  const free = inbox(tasks);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section
        aria-label="Calendário"
        className="animate-rise space-y-3 rounded-3xl border border-border bg-card p-5 md:p-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => move(-1)}>
            <ChevronLeft />
          </Button>
          <h2 className="text-lg font-medium text-ink capitalize">
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

      <section
        aria-label={`Tarefas de ${formatDateBR(selected)}`}
        className="animate-rise space-y-3 rounded-3xl border border-border bg-card p-5 [animation-delay:80ms] md:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-ink">{dayLabel(selected, today)}</h2>
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
          <ul>{chosen.map(row)}</ul>
        ) : (
          <p className="text-muted-foreground">Nada neste dia.</p>
        )}
      </section>

      {/* Tarefas sem dia não cabem no calendário: ficam aqui embaixo, até ganharem um dia. */}
      {free.length > 0 && (
        <section
          aria-label="Sem dia"
          className="animate-rise space-y-2 rounded-3xl border border-border bg-canvas p-5 md:p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-medium text-ink">Sem dia</h2>
          <p className="text-sm text-muted-foreground">
            Ideias soltas. Quando souber o dia, escolha em &quot;Quando?&quot;.
          </p>
          <ul>{free.map(row)}</ul>
        </section>
      )}
    </div>
  );
}
