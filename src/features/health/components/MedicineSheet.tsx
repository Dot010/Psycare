"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KIND_INFO } from "@/features/pro/prescriptionRules";
import type { PrescriptionKind } from "@/features/pro/types";
import { MEDICINE_DISCLAIMER, medicineInfoFor } from "../medicineInfo";
import { MedicineArt } from "./MedicineArt";

const BAND: Record<PrescriptionKind, string> = {
  A: "#b8960b",
  B: "#3b6a8a",
  C1: "#5e7638",
  common: "#5e7638",
};

interface Props {
  nome: string;
  dosagem: string;
  /** Tipo da receita atual, se houver. */
  kind?: PrescriptionKind;
  onClose: () => void;
}

/** Ficha do remédio: para que serve, efeitos, quando procurar o médico, preço máximo e a bula. */
export function MedicineSheet({ nome, dosagem, kind, onClose }: Props) {
  const info = medicineInfoFor(nome);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {nome}{" "}
            <span className="text-base font-normal text-muted-foreground">{dosagem.split(",")[0]}</span>
          </DialogTitle>
          <DialogDescription>
            {kind
              ? `Receita ${KIND_INFO[kind].label.toLowerCase()} (${KIND_INFO[kind].paper}).`
              : "Ficha do remédio."}
          </DialogDescription>
        </DialogHeader>

        {info ? (
          <div className="space-y-4">
            <MedicineArt nome={nome} dosagem={dosagem} info={info} band={BAND[kind ?? "common"]} />
            <section className="space-y-1">
              <h3 className="font-semibold text-foreground">Para que serve</h3>
              <p className="text-sm text-muted-foreground">{info.uso}</p>
            </section>
            <section className="space-y-1">
              <h3 className="font-semibold text-foreground">Efeitos comuns</h3>
              <p className="text-sm text-muted-foreground">{info.efeitos}</p>
            </section>
            <section className="space-y-1">
              <h3 className="font-semibold text-foreground">Procure seu médico se</h3>
              <p className="text-sm text-muted-foreground">{info.procurarMedico}</p>
            </section>
            <section className="space-y-1">
              <h3 className="font-semibold text-foreground">Preço máximo</h3>
              <p className="text-sm text-muted-foreground">
                {info.preco} (lista CMED de {info.precoData}, valor de exemplo). A farmácia pode cobrar menos.
              </p>
            </section>
            <a
              className="text-sm font-medium text-brand-ink underline"
              href="https://consultas.anvisa.gov.br/#/bulario/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver a bula completa (ANVISA)
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ainda não temos a ficha deste remédio. Veja a bula ou pergunte ao seu médico.
          </p>
        )}

        <p className="text-xs text-muted-foreground">{MEDICINE_DISCLAIMER}</p>
        <DialogFooter>
          <Button className="min-h-11" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
