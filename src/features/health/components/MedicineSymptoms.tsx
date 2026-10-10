"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import { intensityLabel } from "../logic";
import { useHealth } from "../hooks/useHealth";
import { SymptomLogger } from "./SymptomLogger";

/** Sintomas ligados a um remédio: o paciente anota o que sentiu e com que intensidade, pela ficha dele. */
export function MedicineSymptoms({ nome }: { nome: string }) {
  const health = useHealth();
  const [open, setOpen] = useState(false);
  const key = nome.trim().toLowerCase();
  const mine = health.sintomas
    .filter((s) => (s.remedio ?? "").trim().toLowerCase() === key)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  return (
    <section aria-label="Sintomas com este remédio" className="space-y-2">
      <h3 className="font-semibold text-foreground">Senti algo com este remédio?</h3>
      {mine.length > 0 && (
        <ul className="text-sm text-muted-foreground">
          {mine.map((s) => (
            <li key={s.id}>
              {formatDateBR(s.data)} · {s.descricao} · {intensityLabel(s.intensidade)}
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <SymptomLogger
          idPrefix={`sintoma-${key.replace(/\s+/g, "-")}`}
          onLog={(names, intensity) => health.logSymptoms(names, intensity, "", nome)}
        />
      ) : (
        <Button variant="outline" className="min-h-11" onClick={() => setOpen(true)}>
          Registrar sintoma
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        Seu psiquiatra vê isto se você compartilhar os sintomas.
      </p>
    </section>
  );
}
