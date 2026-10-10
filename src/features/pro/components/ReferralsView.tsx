"use client";

import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { useReferrals } from "@/features/referral/hooks/useReferrals";
import { isOpen, stageOf } from "@/features/referral/logic";
import { formatDateBR } from "@/lib/format";
import { patientById } from "../data";

/** O psiquiatra vê os pedidos de encaminhamento e registra quando deixa o papel pronto (entregue em mãos). */
export default function ReferralsView() {
  const { referrals, issue } = useReferrals();
  const open = referrals.filter((r) => isOpen(r));
  const waiting = open.filter((r) => stageOf(r) === "requested");
  const issued = referrals.filter((r) => !r.canceled && stageOf(r) !== "requested");
  const name = (id: string) => patientById(id)?.name ?? "Paciente";

  return (
    <Page
      title="Encaminhamentos"
      description="Pedidos dos pacientes para a psicóloga. O papel é entregue em mãos; aqui você só registra."
      width="narrow"
    >
      <section aria-labelledby="enc-pedidos" className="space-y-3">
        <h2 id="enc-pedidos" className="text-2xl font-semibold text-brand-ink">
          Pedidos
        </h2>
        {waiting.length === 0 ? (
          <p className="text-base text-muted-foreground">Nenhum pedido esperando.</p>
        ) : (
          <ul className="space-y-2">
            {waiting.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <p className="text-lg font-medium text-foreground">{name(r.patientId)}</p>
                  <p className="text-sm text-muted-foreground">Pediu em {formatDateBR(r.requestedAt)}</p>
                </div>
                <Button
                  className="min-h-11"
                  onClick={() => issue(r.id)}
                  aria-label={`Deixei pronto: ${name(r.patientId)}`}
                >
                  Deixei pronto
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="enc-emitidos" className="space-y-3 border-t border-border pt-8">
        <h2 id="enc-emitidos" className="text-2xl font-semibold text-brand-ink">
          Já emitidos
        </h2>
        {issued.length === 0 ? (
          <p className="text-base text-muted-foreground">Nada emitido ainda.</p>
        ) : (
          <ul>
            {issued.map((r) => (
              <li key={r.id} className="border-t border-border py-3">
                <p className="text-lg font-medium text-foreground">{name(r.patientId)}</p>
                <p className="text-sm text-muted-foreground">
                  Emitido em {formatDateBR(r.issuedAt as string)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
