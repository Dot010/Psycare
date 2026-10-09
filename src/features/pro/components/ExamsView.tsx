"use client";

import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { patientById, PATIENTS } from "../data";
import { advanceLabel, EXAM_CATALOG, STEP_LABEL } from "../exams";
import { usePrescriptions } from "../hooks/usePrescriptions";

const control = "h-11 w-full rounded-lg border border-border bg-card px-3 text-base";

export default function ExamsView() {
  const { exams, requestExam, advanceExam } = usePrescriptions();
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState(PATIENTS[0].id);
  const [pick, setPick] = useState("");

  const sorted = [...exams].sort((a, b) => b.step - a.step);
  const newResults = exams.filter((e) => e.step === 3).length;

  return (
    <Page
      title="Exames"
      description={
        newResults > 0 ? `${newResults} com resultado para ler.` : "Acompanhe cada pedido até o resultado."
      }
      width="narrow"
      actions={
        <Button className="min-h-11" onClick={() => setOpen(true)}>
          Pedir exame
        </Button>
      }
    >
      <DemoNotice>
        Os pedidos e resultados são de exemplo. Nada é enviado a laboratório nem emitido de verdade.
      </DemoNotice>

      <ul className="space-y-3">
        {sorted.map((exam) => {
          const action = advanceLabel(exam.step);
          return (
            <li key={exam.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{patientById(exam.patientId)?.name}</p>
                  <h2 className="text-lg font-semibold text-foreground">{exam.nome}</h2>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                    exam.step === 3 ? "bg-sun-100 text-ink" : "bg-brand-100 text-brand-ink",
                  )}
                >
                  {STEP_LABEL[exam.step]}
                </span>
              </div>
              <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={cn("h-1.5 flex-1 rounded-full", n <= exam.step ? "bg-brand-600" : "bg-border")}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Pedido · Coletado · Resultado</p>
              {exam.result && (
                <p className="rounded-xl bg-sun-50 px-3 py-2 text-sm text-foreground">{exam.result}</p>
              )}
              {action && (
                <Button variant="outline" className="min-h-11" onClick={() => advanceExam(exam)}>
                  {action}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
          <DialogTitle className="text-xl font-bold text-foreground">Pedir um exame</DialogTitle>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!pick) return;
              requestExam(patient, pick);
              setPick("");
              setOpen(false);
            }}
          >
            <label className="block space-y-1 text-sm text-muted-foreground">
              Paciente
              <select value={patient} onChange={(e) => setPatient(e.target.value)} className={control}>
                {PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="space-y-2">
              <legend className="text-sm text-muted-foreground">Exame</legend>
              <div className="flex flex-wrap gap-2">
                {EXAM_CATALOG.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={pick === name}
                    onClick={() => setPick(name)}
                    className={cn(
                      "min-h-11 rounded-full border-[1.5px] px-4 text-sm font-medium",
                      pick === name ? "border-brand-600 bg-brand-100" : "border-border bg-card",
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </fieldset>
            <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!pick}>
                Pedir (simulado)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
