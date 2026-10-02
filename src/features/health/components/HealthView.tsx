"use client";

import { Pill, Plus, Stethoscope } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { MedicamentoDialog } from "@/features/health/components/MedicamentoDialog";
import { SintomaDialog } from "@/features/health/components/SintomaDialog";
import { useHealth } from "@/features/health/hooks/useHealth";
import type { Medicamento, Sintoma } from "@/features/health/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "remedios", label: "Meus Remédios" },
  { id: "exames", label: "Meus Exames" },
  { id: "sintomas", label: "Meus Sintomas" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-sm";
const metaClass = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function SectionHeader({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {action}
    </div>
  );
}

export default function HealthView() {
  const { remedios, sintomas, exames, saveRemedio, saveSintoma, deleteRemedio, deleteSintoma } = useHealth();
  const [activeTab, setActiveTab] = useState<TabId>("remedios");
  const [remedioOpen, setRemedioOpen] = useState(false);
  const [editingRemedio, setEditingRemedio] = useState<Medicamento | undefined>();
  const [sintomaOpen, setSintomaOpen] = useState(false);
  const [editingSintoma, setEditingSintoma] = useState<Sintoma | undefined>();

  const openRemedio = (item?: Medicamento) => {
    setEditingRemedio(item);
    setRemedioOpen(true);
  };
  const openSintoma = (item?: Sintoma) => {
    setEditingSintoma(item);
    setSintomaOpen(true);
  };

  return (
    <Page
      title="Gestão de Saúde"
      description="Acompanhe seus medicamentos, exames e registre sintomas do dia a dia."
      width="wide"
    >
      <div
        role="tablist"
        aria-label="Seções de saúde"
        className="flex gap-2 overflow-x-auto border-b border-border pb-3"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-brand-600 text-white"
                : "bg-sunken text-muted-foreground hover:bg-border",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="space-y-4"
      >
        {activeTab === "remedios" && (
          <>
            <SectionHeader
              title="Medicamentos ativos"
              action={
                <Button onClick={() => openRemedio()}>
                  <Plus />
                  Adicionar remédio
                </Button>
              }
            />
            {remedios.length === 0 ? (
              <EmptyState
                title="Nenhum medicamento cadastrado"
                description="Registre o que você toma, com dose e horário, para ter tudo em um só lugar."
                action={
                  <Button onClick={() => openRemedio()}>
                    <Pill />
                    Adicionar o primeiro
                  </Button>
                }
              />
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {remedios.map((item) => (
                  <li key={item.id} className={cn(cardClass, "space-y-2")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={metaClass}>
                        {item.frequencia} • {item.horario}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-ink">
                          {item.dosagem}
                        </span>
                        <ItemMenu
                          label={`medicamento ${item.nome}`}
                          onEdit={() => openRemedio(item)}
                          onDelete={() => deleteRemedio(item.id)}
                        />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-foreground">{item.nome}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === "exames" && (
          <>
            <SectionHeader
              title="Histórico de exames"
              action={
                <Button disabled title="Em breve">
                  <Plus />
                  Enviar exame
                </Button>
              }
            />
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {exames.map((exame) => (
                <li key={exame.id} className={cn(cardClass, "space-y-2")}>
                  <span className={metaClass}>Data: {exame.data}</span>
                  <p className="text-lg font-bold text-foreground">{exame.titulo}</p>
                  <p className="text-xs font-medium text-brand-ink">Resultado: {exame.resultado}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        {activeTab === "sintomas" && (
          <>
            <SectionHeader
              title="Registro de sintomas"
              action={
                <Button onClick={() => openSintoma()}>
                  <Plus />
                  Registrar sintoma
                </Button>
              }
            />
            {sintomas.length === 0 ? (
              <EmptyState
                title="Nenhum sintoma registrado"
                description="Anotar o que você sente ajuda a perceber padrões e a conversar melhor na consulta."
                action={
                  <Button onClick={() => openSintoma()}>
                    <Stethoscope />
                    Registrar o primeiro
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {sintomas.map((item) => (
                  <li key={item.id} className={cn(cardClass, "space-y-1")}>
                    <div className="flex items-start justify-between gap-2">
                      <span className={metaClass}>{item.data}</span>
                      <ItemMenu
                        label={`sintoma ${item.descricao}`}
                        onEdit={() => openSintoma(item)}
                        onDelete={() => deleteSintoma(item.id)}
                      />
                    </div>
                    <p className="text-lg font-bold text-foreground">{item.descricao}</p>
                    <p className="text-xs font-medium text-brand-ink">Intensidade/nota: {item.nota}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <MedicamentoDialog
        open={remedioOpen}
        onOpenChange={setRemedioOpen}
        item={editingRemedio}
        onSave={saveRemedio}
      />
      <SintomaDialog
        open={sintomaOpen}
        onOpenChange={setSintomaOpen}
        item={editingSintoma}
        onSave={saveSintoma}
      />
    </Page>
  );
}
