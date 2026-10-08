"use client";

import Link from "next/link";
import { Canteiro } from "@/features/mood/components/Canteiro";
import { WeekChart } from "@/features/mood/components/WeekChart";
import { useMood } from "@/features/mood/hooks/useMood";
import {
  averageOf,
  formatDecimal,
  impactSentence,
  lastLevels,
  mean,
  monthTitle,
  shiftDate,
  strongestTagImpact,
  tagFrequency,
  weekSentence,
} from "@/features/mood/logic";
import { getAnxietyTrend } from "@/features/diary/utils";

function AnxietyLine({ values }: { values: (number | null)[] }) {
  const known = values.flatMap((value, index) => (value === null ? [] : [{ index, value }]));
  if (known.length < 2) return null;
  const x = (index: number) => (index / (values.length - 1)) * 120;
  const y = (value: number) => 30 - ((value - 1) / 4) * 24;
  const points = known.map((item) => `${x(item.index).toFixed(1)},${y(item.value).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 120 36" width="120" height="36" aria-hidden className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-sun-500)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const sectionTitle = "text-xl font-semibold text-brand-ink";

/** A página Humor: a semana, o canteiro do mês e o que mais anda junto com os dias difíceis. */
export default function MoodView() {
  const { checkIns, entries, levels, today } = useMood();

  const week = lastLevels(levels, today, 7);
  const previousWeek = lastLevels(levels, shiftDate(today, -7), 7);
  const average = averageOf(week);
  const previousAverage = averageOf(previousWeek);

  const tags = tagFrequency(checkIns, today, 30, 5);
  const impact = strongestTagImpact(checkIns, levels);

  const anxiety = getAnxietyTrend(entries, today, 14);
  const anxietyAverage = mean(anxiety.flatMap((point) => (point.average === null ? [] : [point.average])));

  const hasAnything = levels.size > 0;

  return (
    <div className="bg-linear-to-b from-brand-100/70 to-transparent">
      <div className="mx-auto w-full max-w-2xl space-y-12 px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <header className="space-y-2">
          <p className="text-xs font-medium tracking-widest text-brand-accent uppercase">
            Humor · esta semana
          </p>
          {average === null ? (
            <h1 className="text-3xl leading-tight font-semibold text-ink">Seu humor, sem pressa</h1>
          ) : (
            <h1 className="flex items-baseline gap-3 text-ink">
              <span className="text-8xl leading-none font-semibold tracking-tight text-brand-ink">
                {formatDecimal(average)}
              </span>
              <span className="text-lg text-muted-foreground">de 5</span>
            </h1>
          )}
          <p className="max-w-sm text-lg leading-snug text-foreground">
            {weekSentence(average, previousAverage)}
          </p>
          {!hasAnything && (
            <Link
              href="/dashboard/home"
              className="inline-block pt-2 text-sm font-semibold text-brand-ink underline-offset-4 hover:underline"
            >
              Fazer o primeiro check-in
            </Link>
          )}
        </header>

        <section aria-label="Humor dia a dia" className="-mx-5 md:-mx-8">
          <WeekChart days={week} />
        </section>

        <section className="space-y-4">
          <h2 className={sectionTitle}>Seu canteiro de {monthTitle(today).toLowerCase()}</h2>
          <Canteiro levels={levels} today={today} />
          <p className="text-sm text-muted-foreground">
            Cada flor é um dia. Quanto maior e mais amarela, mais leve.
          </p>
        </section>

        {tags.length > 0 && (
          <section className="space-y-4">
            <h2 className={sectionTitle}>O que mais pesou</h2>
            <ul className="space-y-3 text-base">
              {tags.map((item) => (
                <li key={item.tag} className="flex items-baseline gap-2">
                  <span className="font-medium text-foreground">{item.tag}</span>
                  <span aria-hidden className="flex-1 border-b-2 border-dotted border-border" />
                  <span className="font-semibold text-brand-ink">
                    {item.days} {item.days === 1 ? "dia" : "dias"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">Nos últimos 30 dias.</p>
          </section>
        )}

        {anxietyAverage !== null && (
          <section className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-medium text-foreground">Ansiedade, 14 dias</h2>
              <p className="text-sm text-muted-foreground">
                Média {formatDecimal(anxietyAverage)} de 5 · menor é mais leve
              </p>
            </div>
            <AnxietyLine values={anxiety.map((point) => point.average)} />
          </section>
        )}

        {impact && (
          <section className="space-y-3">
            <p className="text-xl leading-snug font-medium text-foreground">{impactSentence(impact)}</p>
            <p className="text-sm text-muted-foreground">Vale comentar isso na próxima consulta.</p>
          </section>
        )}

        <p className="text-xs text-muted-foreground">
          Um resumo dos seus registros, não um diagnóstico. Se estiver difícil, o botão de ajuda está sempre à
          mão.
        </p>
      </div>
    </div>
  );
}
