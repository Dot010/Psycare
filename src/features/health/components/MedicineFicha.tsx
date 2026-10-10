"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import { latestPerMedicine, pendingPrescription } from "@/features/pro/prescriptionRules";
import { medTimes } from "../logic";
import { medicineInfoFor } from "../medicineInfo";
import { useStock } from "../hooks/useStock";
import { daysOfSupply, isRunningLow, remainingUnits } from "../stock";
import type { Medicamento } from "../types";
import { MedicineActions } from "./MedicineActions";
import { MedicineArt } from "./MedicineArt";
import { MedicineSheet } from "./MedicineSheet";

/** Um remédio em "Meus remédios": caixa 3D, nome, horários, avisos e a ficha com estoque e receita. */
export function MedicineFicha({
  item,
  taken,
  children,
}: {
  item: Medicamento;
  taken: string[];
  /** Nome, dose e horários, ao lado do desenho. */
  children: React.ReactNode;
}) {
  const { today, prescriptions, steps } = usePrescriptions();
  const { stockOf } = useStock();
  const [open, setOpen] = useState(false);

  const key = item.nome.trim().toLowerCase();
  const rx = latestPerMedicine(prescriptions.filter((p) => p.patientId === LIVE_PATIENT_ID)).find(
    (p) => p.nome.trim().toLowerCase() === key,
  );
  const pending = pendingPrescription(prescriptions, LIVE_PATIENT_ID, item.nome, steps, today);
  const stock = stockOf(item.nome);
  const days = stock ? daysOfSupply(remainingUnits(stock, taken, item.id), medTimes(item).length) : undefined;
  const low = days !== undefined && isRunningLow(days);

  return (
    <>
      <button
        type="button"
        aria-label={`Abrir a ficha de ${item.nome}`}
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-xl focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
      >
        <MedicineArt
          nome={item.nome}
          dosagem={item.dosagem}
          info={medicineInfoFor(item.nome)}
          band="#5e7638"
          compact
        />
      </button>
      <div className="min-w-0">
        {children}
        {low && (
          <p className="text-sm font-medium text-brand-ink">
            Acabando: dá para uns {days} {days === 1 ? "dia" : "dias"}.
          </p>
        )}
        {pending && <p className="text-sm font-medium text-brand-ink">Receita pronta para retirar.</p>}
        <Button variant="ghost" className="min-h-11 px-0" onClick={() => setOpen(true)}>
          Ver ficha de {item.nome}
        </Button>
      </div>
      {open && (
        <MedicineSheet
          nome={item.nome}
          dosagem={rx?.dosagem ?? item.dosagem}
          kind={rx?.kind}
          prescribed={rx?.dosagem}
          onClose={() => setOpen(false)}
        >
          <MedicineActions item={item} taken={taken} />
        </MedicineSheet>
      )}
    </>
  );
}
