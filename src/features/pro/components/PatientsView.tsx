"use client";

import Link from "next/link";
import { useState } from "react";
import { fieldControlClass } from "@/components/ui/input";
import { Page } from "@/components/layout/Page";
import { MoodFace } from "@/features/mood/components/MoodFace";
import type { MoodLevel } from "@/features/mood/types";
import { daysSinceLastMood, moodTrend, trendSentence } from "../logic";
import { usePro } from "../hooks/usePro";

export default function PatientsView() {
  const pro = usePro();
  const [query, setQuery] = useState("");
  const [onlyToday, setOnlyToday] = useState(false);
  const plain = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const todayIds = new Set(
    pro.sessions.filter((s) => s.data === pro.today && s.status !== "cancelado").map((s) => s.patientId),
  );
  const shown = pro.patients.filter(
    (p) => plain(p.name).includes(plain(query.trim())) && (!onlyToday || todayIds.has(p.id)),
  );
  return (
    <Page
      title="Pacientes"
      description="Quem você acompanha e o que cada um escolheu compartilhar."
      width="narrow"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="patient-search" className="sr-only">
          Buscar paciente pelo nome
        </label>
        <input
          id="patient-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pelo nome"
          className={`${fieldControlClass} max-w-xs`}
        />
        <button
          type="button"
          aria-pressed={onlyToday}
          onClick={() => setOnlyToday((v) => !v)}
          className="min-h-11 rounded-full border border-border px-4 text-sm aria-pressed:border-brand-600 aria-pressed:bg-brand-50 aria-pressed:font-medium aria-pressed:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
        >
          Atendo hoje
        </button>
      </div>
      {shown.length === 0 && <p className="text-base text-muted-foreground">Nenhum paciente encontrado.</p>}
      <ul>
        {shown.map((patient) => {
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
