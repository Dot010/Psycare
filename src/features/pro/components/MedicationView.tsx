"use client";

import Link from "next/link";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { usePro } from "../hooks/usePro";
import { adherence } from "../prescriptions";

/**
 * Adesão em resumo: uma linha por paciente, com quem mais precisa de atenção primeiro.
 * Os detalhes (cada remédio, horários, sintomas) ficam na ficha do paciente, na aba Medicação.
 */
export default function MedicationView({ embedded = false }: { embedded?: boolean }) {
  const pro = usePro();
  const rows = pro.patients
    .map((patient) => {
      const snap = pro.snapshotOf(patient.id);
      const taken = snap?.meds?.reduce((sum, m) => sum + m.taken, 0) ?? 0;
      const planned = snap?.meds?.reduce((sum, m) => sum + m.planned, 0) ?? 0;
      return { patient, snap, taken, planned, percent: adherence(taken, planned) };
    })
    .sort((a, b) => (a.percent ?? 101) - (b.percent ?? 101));

  return (
    <Page
      embedded={embedded}
      title="Medicação"
      description="Quem está tomando os remédios, nos últimos 7 dias. Só o que foi compartilhado."
      width="narrow"
      className="space-y-6"
    >
      <DemoNotice>Dados de exemplo. Nada aqui é prescrição de verdade.</DemoNotice>
      <ul>
        {rows.map(({ patient, snap, taken, planned, percent }) => (
          <li key={patient.id} className="border-t border-border">
            <Link
              href={`/dashboard/pro/patients/${patient.id}`}
              className="flex items-center justify-between gap-3 py-4 hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
            >
              <span>
                <span className="block text-lg font-medium text-foreground">{patient.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {!snap?.meds
                    ? "Não compartilha dados de saúde."
                    : snap.meds.length === 0
                      ? "Nenhum remédio cadastrado."
                      : `${snap.meds.map((m) => m.nome).join(", ")} · ${adherenceText(taken, planned)}`}
                  {snap?.symptoms && snap.symptoms.length > 0
                    ? ` · ${snap.symptoms.length} ${snap.symptoms.length === 1 ? "sintoma relatado" : "sintomas relatados"}`
                    : ""}
                </span>
              </span>
              {percent !== null && (
                <span
                  className={
                    percent < 70
                      ? "rounded-full bg-sun-100 px-3 py-1 text-sm font-semibold text-sun-700"
                      : "rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-ink"
                  }
                >
                  {percent}%
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}

function adherenceText(taken: number, planned: number): string {
  const percent = adherence(taken, planned);
  if (percent === null) return "sem doses previstas nos últimos 7 dias";
  return `${percent}% das doses marcadas nos últimos 7 dias (${taken} de ${planned})`;
}
