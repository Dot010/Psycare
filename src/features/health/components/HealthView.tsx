"use client";

import { FileText, Paperclip, Pill, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { useMood } from "@/features/mood/hooks/useMood";
import { ConsultDialog } from "@/features/health/components/ConsultDialog";
import { DoseTimeline } from "@/features/health/components/DoseTimeline";
import { ExameDialog } from "@/features/health/components/ExameDialog";
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
  doseSentence,
  dosesForDay,
  intensityLabel,
  medTimes,
  weekAdherence,
  weekSentence,
} from "@/features/health/logic";
import type { Exame, Sintoma } from "@/features/health/types";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";

const h2 = "text-2xl font-semibold text-brand-ink";
const sectionClass = "space-y-4 border-t border-border pt-8";

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

  return (
    <Page title="Hoje" description={todayLabel()} width="narrow" className="space-y-10 md:space-y-12">
      <section aria-labelledby="doses-title" className="space-y-3">
        <h2 id="doses-title" className={h2}>
          {doseSentence(doses.length, takenToday)}
        </h2>
        {doses.length > 0 ? (
          <DoseTimeline
            doses={doses}
            taken={health.taken}
            onToggle={(d) => health.toggleDose(d.key, today)}
          />
        ) : (
          <p className="max-w-prose text-base text-foreground">
            {remedios.length === 0
              ? "Cadastre seus remédios com horário e o app mostra aqui o que tomar em cada hora."
              : "Seus remédios ainda não têm horário. Edite para escolher quando tomar."}
          </p>
        )}
      </section>

      <section aria-labelledby="body-title" className={sectionClass}>
        <h2 id="body-title" className={h2}>
          E o corpo, como está?
        </h2>
        <SymptomLogger onLog={(names, intensity) => health.logSymptoms(names, intensity)} />
      </section>

      <section aria-labelledby="week-title" className={sectionClass}>
        <h2 id="week-title" className={h2}>
          Sua semana
        </h2>
        <WeekDots days={week} />
        <p className="max-w-prose text-sm text-muted-foreground">{weekSentence(week)}</p>
      </section>

      <section aria-labelledby="meds-title" className={sectionClass}>
        <h2 id="meds-title" className={h2}>
          Meus remédios
        </h2>
        <p className="text-sm text-muted-foreground">
          Quem escolhe os seus remédios é o seu psiquiatra. Aqui você acompanha o que sobra e pede a receita.
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
                  className="flex items-center justify-between gap-3 border-t border-border py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MedicineFicha item={item} taken={health.taken}>
                      <p className="text-lg font-medium text-foreground">
                        <Pill className="mr-2 inline size-4 text-brand-accent" aria-hidden />
                        {item.nome}{" "}
                        <span className="text-base font-normal text-muted-foreground">{item.dosagem}</span>
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
        <p className="text-xs text-muted-foreground">
          O PsyCare não substitui seu médico e nunca muda sua dose. Dúvidas sobre o remédio são com ele.
        </p>
      </section>

      <section aria-labelledby="sym-title" className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="sym-title" className={h2}>
            Sintomas recentes
          </h2>
          <Button variant="outline" onClick={() => openSintoma()}>
            <Plus />
            Registrar
          </Button>
        </div>
        {recentSymptoms.length === 0 ? (
          <p className="text-base text-muted-foreground">Nada registrado. Anotar ajuda a perceber padrões.</p>
        ) : (
          <ul>
            {recentSymptoms.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-t border-border py-3"
              >
                <div>
                  <p className="text-lg font-medium text-foreground">{item.descricao}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateBR(item.data)} · {intensityLabel(item.intensidade)}
                    {item.remedio ? ` · ${item.remedio}` : ""}
                    {item.nota && item.intensidade ? ` · ${item.nota}` : ""}
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
      </section>

      <section aria-labelledby="exam-title" className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="exam-title" className={h2}>
            Meus exames
          </h2>
          <Button variant="outline" onClick={() => openExame()}>
            <Plus />
            Guardar exame
          </Button>
        </div>
        {exames.length === 0 ? (
          <p className="max-w-prose text-base text-muted-foreground">
            Guarde aqui um exame com o arquivo, para ter tudo à mão na consulta. Fica só neste navegador.
          </p>
        ) : (
          <ul>
            {exames.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 border-t border-border py-3"
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
      </section>

      <footer className="space-y-3 border-t border-border pt-8">
        <Button onClick={() => setConsultOpen(true)}>
          <FileText />
          Gerar resumo para a consulta
        </Button>
        <p className="max-w-prose text-xs text-muted-foreground">
          Reúne remédios, doses, sintomas e humor dos últimos 30 dias para você mostrar ao seu profissional.
        </p>
      </footer>

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
