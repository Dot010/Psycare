"use client";

import Link from "next/link";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { usePro } from "../hooks/usePro";
import { adherence } from "../prescriptions";

export default function MedicationView() {
  const pro = usePro();
  const rows = pro.patients.map((patient) => ({ patient, snap: pro.snapshotOf(patient.id) }));

  return (
    <Page
      title="Medicação"
      description="Remédios, adesão e efeitos que os pacientes relatam. Só o que foi compartilhado."
      width="narrow"
      className="space-y-10"
    >
      <DemoNotice>Dados de exemplo. Nada aqui é prescrição de verdade.</DemoNotice>
      {rows.map(({ patient, snap }) => (
        <section key={patient.id} aria-label={patient.name} className="space-y-2">
          <h2 className="text-2xl font-semibold text-brand-ink">
            <Link href={`/dashboard/pro/patients/${patient.id}`} className="hover:underline">
              {patient.name}
            </Link>
          </h2>
          {!snap?.meds && !snap?.symptoms ? (
            <p className="text-base text-muted-foreground">Não compartilha dados de saúde.</p>
          ) : (
            <>
              {snap.meds && snap.meds.length > 0 ? (
                <ul>
                  {snap.meds.map((m) => (
                    <li key={m.nome} className="border-t border-border py-2 text-base text-foreground">
                      {m.nome} <span className="text-muted-foreground">{m.dosagem}</span>
                      <span className="block text-sm text-muted-foreground">
                        {m.horarios} · {adherenceText(m.taken, m.planned)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-muted-foreground">Nenhum remédio cadastrado.</p>
              )}
              {snap.symptoms && snap.symptoms.length > 0 && (
                <p className="text-sm text-foreground">
                  <span className="font-medium">Efeitos e sintomas relatados: </span>
                  {snap.symptoms
                    .map(
                      (s) =>
                        `${s.nome} (${s.vezes}x${s.media !== null ? `, média ${String(s.media).replace(".", ",")}/5` : ""})`,
                    )
                    .join(" · ")}
                </p>
              )}
            </>
          )}
        </section>
      ))}
    </Page>
  );
}

function adherenceText(taken: number, planned: number): string {
  const percent = adherence(taken, planned);
  if (percent === null) return "sem doses previstas nos últimos 7 dias";
  return `${percent}% das doses marcadas nos últimos 7 dias (${taken} de ${planned})`;
}
