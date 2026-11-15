"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Block } from "@/components/ui/block";
import { TabPanel, UnderlineTabs } from "@/components/ui/underline-tabs";
import { DrawPanel } from "@/features/diary/components/DrawPanel";
import { MoodMonth } from "@/features/diary/components/MoodMonth";
import { PagesPanel } from "@/features/diary/components/PagesPanel";
import { WritePanel } from "@/features/diary/components/WritePanel";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { writtenDays } from "@/features/diary/utils";
import MoodView from "@/features/mood/components/MoodView";
import { useMood } from "@/features/mood/hooks/useMood";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";

// A semana já aparece no calendário do topo, e desenhar é um jeito de escrever: ficam 3 abas.
type Tab = "escrever" | "paginas" | "humor";

const TABS: { id: Tab; label: string }[] = [
  { id: "escrever", label: "Escrever" },
  { id: "paginas", label: "Páginas" },
  { id: "humor", label: "Humor" },
];

function writingSentence(days: number): string {
  if (days === 0) return "Quando você quiser, é só começar. Uma frase já basta.";
  if (days === 1) return "Você escreveu em 1 dia da última semana.";
  return `Você escreveu em ${days} dias da última semana.`;
}

export default function DiaryView() {
  const { entries, saveEntry, deleteEntry } = useDiary();
  const { levels } = useMood();
  const [tab, setTab] = useState<Tab>(useSearchParams()?.get("aba") === "humor" ? "humor" : "escrever");
  const [mode, setMode] = useState<"texto" | "desenho">("texto");
  const today = toISODate(new Date());
  const written = writtenDays(entries, today);
  const forSession = entries
    .filter((e) => e.discussInSession)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <Page
      title="Como foram seus dias"
      kicker="Diário"
      description="Só você lê. O que for para a sessão, você escolhe."
      width="wide"
    >
      <PageColumns
        aside={
          <>
            <Block label="Sua semana de escrita">
              <div className="flex items-center gap-4">
                <ProgressRing value={written / 7} label={`Escreveu em ${written} de 7 dias`} size={84}>
                  <span className="text-lg font-semibold">
                    <CountUp value={written} />
                    /7
                  </span>
                </ProgressRing>
                <p className="text-sm leading-relaxed">{writingSentence(written)}</p>
              </div>
            </Block>

            <Block
              title="Vai para a sessão"
              aside={
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 font-semibold text-brand-ink">
                  {forSession.length}
                </span>
              }
            >
              {forSession.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ao escrever, marque &quot;levar para a sessão&quot; e a página aparece aqui.
                </p>
              ) : (
                <ul>
                  {forSession.map((e) => (
                    <li key={e.id} className="border-t border-sunken py-2.5 first:border-t-0">
                      <p className="text-xs text-muted-foreground">{formatDateBR(e.date)}</p>
                      <p className="line-clamp-2 text-sm leading-relaxed">{e.title}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/dashboard/appointments"
                className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-brand-ink underline"
              >
                Ver em Consultas
              </Link>
            </Block>
          </>
        }
      >
        <MoodMonth levels={levels} entries={entries} today={today} />

        <Block label="Páginas do diário">
          <UnderlineTabs
            label="Seções do diário"
            tabs={TABS}
            value={tab}
            onChange={setTab}
            className="mb-6"
          />
          <TabPanel key={tab} label={TABS.find((t) => t.id === tab)!.label}>
            {tab === "escrever" && (
              <>
                <div role="group" aria-label="Como registrar" className="mb-5 flex gap-2">
                  {(["texto", "desenho"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      onClick={() => setMode(m)}
                      className="min-h-11 rounded-full border border-border px-4 text-sm font-medium aria-pressed:border-brand-600 aria-pressed:bg-brand-50 aria-pressed:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                    >
                      {m === "texto" ? "Escrever" : "Desenhar"}
                    </button>
                  ))}
                </div>
                {mode === "texto" ? <WritePanel onSave={saveEntry} /> : <DrawPanel onSave={saveEntry} />}
              </>
            )}
            {tab === "humor" && <MoodView />}
            {tab === "paginas" && (
              <PagesPanel entries={entries} today={today} onSave={saveEntry} onDelete={deleteEntry} />
            )}
          </TabPanel>
        </Block>
      </PageColumns>
    </Page>
  );
}
