"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import { pendingPrescription, requestStage } from "@/features/pro/prescriptionRules";
import { formatDateBR } from "@/lib/format";
import { addDays } from "../logic";
import { medicineInfoFor, unitName } from "../medicineInfo";
import { daysOfSupply, isRunningLow, remainingUnits } from "../stock";
import { useStock } from "../hooks/useStock";
import type { Medicamento } from "../types";
import { medTimes } from "../logic";

const field = "h-11 w-24 rounded-xl border border-border bg-card px-3 text-base";

/** Estoque de um remédio e o caminho da receita, tudo no mesmo lugar: aviso, pedido, retirada e compra. */
export function MedicineActions({ item, taken }: { item: Medicamento; taken: string[] }) {
  const { today, prescriptions, allRequests, steps, requestNew, cancelRequest, advanceStep } =
    usePrescriptions();
  const { stockOf, setCount } = useStock();
  const [editing, setEditing] = useState(false);
  const [buying, setBuying] = useState(false);
  const [value, setValue] = useState("");

  const info = medicineInfoFor(item.nome);
  const stock = stockOf(item.nome);
  const remaining = stock ? remainingUnits(stock, taken, item.id) : undefined;
  const days = remaining === undefined ? undefined : daysOfSupply(remaining, medTimes(item).length);
  const low = days !== undefined && isRunningLow(days);

  const pending = pendingPrescription(prescriptions, LIVE_PATIENT_ID, item.nome, steps, today);
  const step = pending ? steps[pending.id] : undefined;
  const key = item.nome.trim().toLowerCase();
  const request = allRequests
    .filter((r) => r.patientId === LIVE_PATIENT_ID && r.nome.trim().toLowerCase() === key)
    .filter((r) => !(r.answer?.kind === "ready" && steps[r.answer.prescriptionId ?? ""] === "comprei"))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
  const stage = request ? requestStage(request) : undefined;
  const unit = (n: number) => unitName(info?.forma, n);
  const box = info?.caixa ?? 30;

  const saveCount = () => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || value.trim() === "") return;
    setCount(item.nome, n);
    setEditing(false);
    setValue("");
  };
  const confirmBuy = () => {
    const n = Number(value || box);
    if (!pending || !Number.isFinite(n) || n <= 0) return;
    setCount(item.nome, (remaining ?? 0) + n);
    advanceStep(pending.id);
    setBuying(false);
    setValue("");
  };

  return (
    <section aria-label="Estoque e receita" className="space-y-3 rounded-xl bg-sunken p-4">
      {stock === undefined || editing ? (
        <div className="space-y-2">
          <label htmlFor={`qtd-${item.id}`} className="text-sm font-medium text-foreground">
            {stock === undefined ? `Quantas ${unit(2)} você tem hoje?` : `Contei: tenho quantas ${unit(2)}?`}
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`qtd-${item.id}`}
              type="number"
              min={0}
              inputMode="numeric"
              className={field}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button className="min-h-11" onClick={saveCount}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-foreground">
            Restam cerca de <strong>{remaining}</strong> {unit(remaining ?? 0)}
            {days !== undefined && `, o suficiente para uns ${days} ${days === 1 ? "dia" : "dias"}`}
            {days !== undefined && ` (até ${formatDateBR(addDays(today, days))})`}.
          </p>
          {low && <p className="text-sm font-medium text-brand-ink">Está acabando.</p>}
          <Button variant="ghost" className="min-h-11 px-0" onClick={() => setEditing(true)}>
            Contei e é outra quantidade
          </Button>
        </div>
      )}

      {pending && (
        <div className="space-y-2 border-t border-border pt-3">
          <p className="text-sm font-medium text-foreground">
            Receita pronta para retirar. Retire até {formatDateBR(pending.useUntil)}.
          </p>
          {step === undefined && (
            <Button className="min-h-11" onClick={() => advanceStep(pending.id)}>
              Já retirei a receita
            </Button>
          )}
          {step === "retirei" && !buying && (
            <Button className="min-h-11" onClick={() => setBuying(true)}>
              Já comprei o remédio
            </Button>
          )}
          {step === "retirei" && buying && (
            <div className="space-y-2">
              <label htmlFor={`caixa-${item.id}`} className="text-sm text-foreground">
                Quantas {unit(2)} vieram? (uma caixa costuma ter {box})
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`caixa-${item.id}`}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className={field}
                  value={value || String(box)}
                  onChange={(e) => setValue(e.target.value)}
                />
                <Button className="min-h-11" onClick={confirmBuy}>
                  Confirmar compra
                </Button>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Só você vê isto. Seu médico não sabe.</p>
        </div>
      )}

      {!pending && request && stage === "sent" && (
        <div className="space-y-2 border-t border-border pt-3">
          <p role="status" className="text-sm text-foreground">
            Pedido enviado. Aguardando o seu psiquiatra.
          </p>
          <Button variant="outline" className="min-h-11" onClick={() => cancelRequest(request.id)}>
            Cancelar pedido
          </Button>
        </div>
      )}
      {!pending && request && stage === "consult" && (
        <p className="border-t border-border pt-3 text-sm text-foreground">
          Seu psiquiatra pede uma consulta antes.{" "}
          <Link href="/dashboard/appointments" className="font-medium text-brand-ink underline">
            Marcar consulta
          </Link>
        </p>
      )}
      {!pending && request && stage === "no" && (
        <p className="border-t border-border pt-3 text-sm text-foreground">
          Seu psiquiatra não fará a receita por agora.
          {request.answer?.reason ? ` ${request.answer.reason}.` : " Vamos conversar na próxima consulta."}
        </p>
      )}
      {!pending && !request && low && (
        <div className="border-t border-border pt-3">
          <Button className="min-h-11" onClick={() => requestNew(LIVE_PATIENT_ID, item.nome)}>
            Pedir nova receita
          </Button>
        </div>
      )}
    </section>
  );
}
