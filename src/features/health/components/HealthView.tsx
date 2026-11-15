"use client";

import { FileText, Paperclip, Pill, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { TabPanel, UnderlineTabs } from "@/components/ui/underline-tabs";
import { useMood } from "@/features/mood/hooks/useMood";
import { ConsultDialog } from "@/features/health/components/ConsultDialog";
import { DoseTimeline } from "@/features/health/components/DoseTimeline";
import { ExameDialog } from "@/features/health/components/ExameDialog";
import { ReferralSection } from "@/features/referral/components/ReferralSection";
import { MedicineFicha } from "@/features/health/components/MedicineFicha";
import { SintomaDialog } from "@/features/health/components/SintomaDialog";
import { SymptomLogger } from "@/features/health/components/SymptomLogger";
import { WeekDots } from "@/features/health/components/WeekDots";
import { useHealth } from "@/features/health/hooks/useHealth";
import { medicinesFor } from "@/features/health/medicines";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import {
  buildConsultSummary,
  doseAdherence,
  doseSentence,
  dosesForDay,
  intensityLabel,
  medTimes,
  symptomMoodLink,
  weekAdherence,
  weekSentence,
} from "@/features/health/logic";
import type { Exame, Sintoma } from "@/features/health/types";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tab = "hoje" | "remedios" | "exames" | "encaminhamento";
const TABS: { id: Tab; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "remedios", label: "Remédios" },
  { id: "exames", label: "Exames" },
  { id: "encaminhamento", label: "Encaminhamento" },
];

function tabFrom(value: string | null | undefined): Tab {
  return TABS.some((t) => t.id === value) ? (value as Tab) : "hoje";
}

function todayLabel(): string {
  const text = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function HealthView() {
  const health = useHealth();
  const { prescriptions } = usePrescriptions();
  const remedios = useMemo(
    () => medicinesFor(health.remedios, prescriptions, LIVE_PATIENT_ID),
    [health.remedios, prescriptions],
  );
  const { entries, levels } = useMood();
  const today = toISODate(new Date());

  const [tab, setTab] = useState<Tab>(tabFrom(useSearchParams()?.get("aba")));
  const [sintomaOpen, setSintomaOpen] = useState(false);
  const [editingSintoma, setEditingSintoma] = useState<Sintoma | undefined>();
  const [exameOpen, setExameOpen] = useState(false);
  const [editingExame, setEditingExame] = useState<Exame | undefined>();
  const [consultOpen, setConsultOpen] = useState(false);

  const doses = dosesForDay(remedios, today);
  const takenToday = doses.filter((d) => health.taken.includes(d.key)).length;
  const week = weekAdherence(remedios, health.taken, today);
  const recentSymptoms = [...health.sintomas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8);
  const exames = [...health.exames].sort((a, b) => b.data.localeCompare(a.data));

  const openSintoma = (item?: Sintoma) => {
    setEditingSintoma(item);
    setSintomaOpen(true);
  };
  const openExame = (item?: Exame) => {
    setEditingExame(item);
    setExameOpen(true);
  };

  const summary = consultOpen
    ? buildConsultSummary({
        meds: remedios,
        taken: health.taken,
        sintomas: health.sintomas,
        moodByDay: levels,
        entries,
        today,
      })
    : [];

  const month = doseAdherence(remedios, health.taken, today);
  const link = symptomMoodLink(health.sintomas, levels, today);
  const pct = month.planned ? Math.round((month.taken / month.planned) * 100) : 0;

  return (
    <Page
      title="Remédios e corpo"
      kicker={todayLabel()}
      description="O app só lembra. Mudança de dose, sempre com o seu médico."
      width="wide"
      actions={
        <Button variant="outline" onClick={() => setConsultOpen(true)}>
          <FileText />
          Resumo para a consulta
        </Button>
      }
    >
      <UnderlineTabs label="Seções de Saúde" tabs={TABS} value={tab} onChange={setTab} />

      <TabPanel key={tab} label={TABS.find((t) => t.id === tab)!.label}>
        {tab === "hoje" && (
          <PageColumns
            aside={
              <>
                <Block title="Sua semana">
                  <WeekDots days={week} />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{weekSentence(week)}</p>
                </Block>

                <Block
                  title="Sintomas recentes"
                  aside={
                    <Button variant="ghost" className="min-h-11 px-2" onClick={() => openSintoma()}>
                      <Plus />
                      Registrar
                    </Button>
                  }
                >
                  {recentSymptoms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nada registrado. Anotar ajuda a perceber padrões.
                    </p>
                  ) : (
                    <ul>
                      {recentSymptoms.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 border-t border-sunken py-2.5 first:border-t-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{item.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateBR(item.data)} · {intensityLabel(item.intensidade)}
                              {item.remedio ? ` · ${item.remedio}` : ""}
                            </p>
                          </div>
                          <ItemMenu
                            label={`sintoma ${item.descricao}`}
                            onEdit={() => openSintoma(item)}
                            onDelete={() => health.deleteSintoma(item.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </Block>
              </>
            }
          >
            <Block tone="leaf" size="lg" label="Doses de hoje">
              <div className="flex flex-wrap items-center gap-6">
                {month.taken > 0 ? (
                  <ProgressRing
                    value={month.taken / month.planned}
                    label={`${pct}% das doses tomadas nos últimos 30 dias`}
                    size={140}
                    trackClassName="stroke-card"
                  >
                    <span className="text-3xl font-semibold tracking-tight">
                      <CountUp value={pct} />%
                    </span>
                    <span className="text-xs">das doses</span>
                  </ProgressRing>
                ) : null}
                <div className="min-w-0 flex-1 basis-64 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-medium">{doseSentence(doses.length, takenToday)}</h2>
                    <p className="text-sm">
                      {month.taken > 0
                        ? `${month.taken} de ${month.planned} doses marcadas nos últimos 30 dias.`
                        : "Marque as doses que tomar. Com o tempo, o anel mostra como foi o mês."}
                    </p>
                  </div>
                  {doses.length > 0 ? (
                    <div className="rounded-2xl bg-card p-4">
                      <DoseTimeline
                        doses={doses}
                        taken={health.taken}
                        onToggle={(d) => health.toggleDose(d.key, today)}
                      />
                    </div>
                  ) : (
                    <p className="max-w-prose text-base">
                      {remedios.length === 0
                        ? "Quando seu psiquiatra registrar um remédio com horário, ele aparece aqui."
                        : "Seus remédios ainda não têm horário."}
                    </p>
                  )}
                </div>
              </div>
            </Block>

            <Block title="E o corpo, como está?" size="lg">
              <SymptomLogger onLog={(names, intensity) => health.logSymptoms(names, intensity)} />
              {link && (
                <div className="mt-6 flex flex-wrap items-end gap-6 rounded-2xl bg-canvas p-4">
                  <div className="min-w-0 flex-1 basis-56 space-y-1">
                    <p className="text-sm font-semibold">Uma ligação que apareceu</p>
                    <p className="text-sm leading-relaxed">
                      Nos dias com {link.symptom.toLowerCase()}, seu humor ficou em média{" "}
                      {String(link.withSymptom).replace(".", ",")}. Nos outros,{" "}
                      {String(link.without).replace(".", ",")}. Vale contar isso na consulta.
                    </p>
                  </div>
                  <div
                    role="img"
                    aria-label={`Humor médio de 1 a 5: ${String(link.withSymptom).replace(".", ",")} com ${link.symptom.toLowerCase()}, ${String(link.without).replace(".", ",")} sem`}
                    className="flex h-24 items-end gap-4"
                  >
                    {[
                      {
                        label: `com ${link.symptom.toLowerCase()}`,
                        value: link.withSymptom,
                        color: "bg-taupe",
                      },
                      { label: "nos outros dias", value: link.without, color: "bg-brand-400" },
                    ].map((bar, index) => (
                      <div key={bar.label} className="flex h-full flex-col items-center justify-end gap-1">
                        <span
                          className={cn("animate-grow-up w-11 rounded-xl", bar.color)}
                          style={{ height: `${(bar.value / 5) * 100}%`, animationDelay: `${index * 150}ms` }}
                        />
                        <span className="text-xs text-muted-foreground" aria-hidden>
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Block>
          </PageColumns>
        )}

        {tab === "remedios" && (
          <Block title="Meus remédios" size="lg">
            <p className="-mt-2 mb-3 text-sm text-muted-foreground">
              Quem escolhe os seus remédios é o seu psiquiatra. Aqui você acompanha o que sobra e pede a
              receita.
            </p>
            {remedios.length === 0 ? (
              <p className="text-base text-muted-foreground">Nenhum remédio cadastrado ainda.</p>
            ) : (
              <ul>
                {remedios.map((item) => {
                  const times = medTimes(item);
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-t border-sunken py-3 first:border-t-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <MedicineFicha item={item} taken={health.taken}>
                          <p className="text-lg font-medium text-foreground">
                            <Pill className="mr-2 inline size-4 text-brand-accent" aria-hidden />
                            {item.nome}{" "}
                            <span className="text-base font-normal text-muted-foreground">
                              {item.dosagem}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {times.length ? times.join(" · ") : "Sem horário"}
                            {item.observacao ? ` · ${item.observacao}` : ""}
                          </p>
                        </MedicineFicha>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              O PsyCare não substitui seu médico e nunca muda sua dose. Dúvidas sobre o remédio são com ele.
            </p>
          </Block>
        )}

        {tab === "encaminhamento" && (
          <Block size="lg">
            <ReferralSection />
          </Block>
        )}

        {tab === "exames" && (
          <Block
            title="Meus exames"
            size="lg"
            aside={
              <Button variant="outline" onClick={() => openExame()}>
                <Plus />
                Guardar exame
              </Button>
            }
          >
            {exames.length === 0 ? (
              <p className="max-w-prose text-base text-muted-foreground">
                Guarde aqui um exame com o arquivo, para ter tudo à mão na consulta. Fica só neste navegador.
              </p>
            ) : (
              <ul>
                {exames.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-t border-sunken py-3 first:border-t-0"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-lg font-medium text-foreground">{item.titulo}</p>
                      <p className="text-sm text-muted-foreground">{formatDateBR(item.data)}</p>
                      {item.resultado && <p className="text-sm text-foreground">{item.resultado}</p>}
                      {item.anexo && (
                        <a
                          href={item.anexo.dados}
                          download={item.anexo.nome}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink underline-offset-2 hover:underline"
                        >
                          <Paperclip className="size-3.5" aria-hidden />
                          {item.anexo.nome}
                        </a>
                      )}
                    </div>
                    <ItemMenu
                      label={`exame ${item.titulo}`}
                      onEdit={() => openExame(item)}
                      onDelete={() => health.deleteExame(item.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Block>
        )}
      </TabPanel>

      <SintomaDialog
        key={`sin-${editingSintoma?.id ?? "new"}-${sintomaOpen}`}
        open={sintomaOpen}
        onOpenChange={setSintomaOpen}
        item={editingSintoma}
        onSave={health.saveSintoma}
      />
      <ExameDialog
        key={`exa-${editingExame?.id ?? "new"}-${exameOpen}`}
        open={exameOpen}
        onOpenChange={setExameOpen}
        item={editingExame}
        onSave={health.saveExame}
      />
      <ConsultDialog open={consultOpen} onOpenChange={setConsultOpen} lines={summary} />
    </Page>
  );
}
