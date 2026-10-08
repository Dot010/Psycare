"use client";

import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { MoodFace } from "@/features/mood/components/MoodFace";
import type { MoodLevel } from "@/features/mood/types";
import { daysSinceLastMood, moodTrend, trendSentence } from "../logic";
import { usePro } from "../hooks/usePro";

export default function PatientsView() {
  const pro = usePro();
  return (
    <Page
      title="Pacientes"
      description="Quem você acompanha e o que cada um escolheu compartilhar."
      width="narrow"
    >
      <ul>
        {pro.patients.map((patient) => {
          const snap = pro.snapshotOf(patient.id);
          const trend = moodTrend(snap, pro.today);
          const last = snap?.moodDays?.at(-1);
          const silent = daysSinceLastMood(snap, pro.today);
          return (
            <li key={patient.id} className="border-t border-border">
              <Link
                href={`/dashboard/pro/patients/${patient.id}`}
                className="flex items-center justify-between gap-3 py-4 hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
              >
                <span>
                  <span className="block text-lg font-medium text-foreground">{patient.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {patient.age} anos · {trendSentence(trend)}
                    {silent !== null && silent >= 3 ? ` Último registro há ${silent} dias.` : ""}
                  </span>
                </span>
                {last && <MoodFace level={Math.round(last.level) as MoodLevel} size={36} labelled />}
              </Link>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
