"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { cn } from "@/lib/utils";
import ExamsView from "./ExamsView";
import MedicationView from "./MedicationView";
import PrescriptionsView from "./PrescriptionsView";
import ReferralsView from "./ReferralsView";

export type ClinicalTab = "receitas" | "exames" | "encaminhamentos" | "adesao";
export const CLINICAL_TABS: { id: ClinicalTab; label: string }[] = [
  { id: "receitas", label: "Receitas" },
  { id: "exames", label: "Exames" },
  { id: "encaminhamentos", label: "Encaminhamentos" },
  { id: "adesao", label: "Adesão" },
];

export function clinicalTabFrom(value: string | null | undefined): ClinicalTab {
  return CLINICAL_TABS.some((t) => t.id === value) ? (value as ClinicalTab) : "receitas";
}

/** Tudo o que o psiquiatra decide ou acompanha, numa tela só: receitas, exames, encaminhamentos e adesão. */
export default function ClinicalView() {
  const [tab, setTab] = useState<ClinicalTab>(clinicalTabFrom(useSearchParams()?.get("aba")));

  return (
    <Page
      title="Clínico"
      description="Receitas, exames, encaminhamentos e adesão dos seus pacientes."
      width="narrow"
    >
      <div role="tablist" aria-label="Seções clínicas" className="flex flex-wrap gap-2">
        {CLINICAL_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "min-h-11 rounded-full border px-5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
              tab === item.id
                ? "border-brand-600 bg-brand-100 font-medium text-brand-ink"
                : "border-border text-foreground hover:border-brand-600",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "receitas" && <PrescriptionsView embedded />}
      {tab === "exames" && <ExamsView embedded />}
      {tab === "encaminhamentos" && <ReferralsView embedded />}
      {tab === "adesao" && <MedicationView embedded />}
    </Page>
  );
}
