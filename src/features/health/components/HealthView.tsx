"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import type { Exame, Medicamento, Sintoma } from "@/features/health/types";
import { mockUser } from "@/mocks/user";
import { cn } from "@/lib/utils";

const medicamentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do remédio"),
  dosagem: z.string().trim().min(1, "Informe a dosagem"),
  frequencia: z.string().trim().optional(),
  horario: z.string().trim().optional(),
});

const sintomaSchema = z.object({
  descricao: z.string().trim().min(2, "Descreva o sintoma"),
  nota: z.string().trim().optional(),
});

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

function MedicamentoDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Medicamento) => void;
}) {
  const [form, setForm] = useState({ nome: "", dosagem: "", frequencia: "", horario: "" });
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = medicamentoSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setError("");
    onSave({
      id: crypto.randomUUID(),
      nome: parsed.data.nome,
      dosagem: parsed.data.dosagem,
      frequencia: parsed.data.frequencia || "Uso diário",
      horario: parsed.data.horario || "Horário livre",
    });
    setForm({ nome: "", dosagem: "", frequencia: "", horario: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Novo medicamento</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Nome do remédio"
            required
            value={form.nome}
            onChange={set("nome")}
            placeholder="Ex: Sertralina"
          />
          <Field
            label="Dosagem"
            required
            value={form.dosagem}
            onChange={set("dosagem")}
            placeholder="Ex: 50 mg"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Frequência"
              value={form.frequencia}
              onChange={set("frequencia")}
              placeholder="Ex: Diária"
            />
            <Field label="Horário" value={form.horario} onChange={set("horario")} placeholder="Ex: 21:00" />
          </div>
          {error && (
            <p role="alert" className="text-xs text-danger-600">
              {error}
            </p>
          )}
          <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SintomaDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Sintoma) => void;
}) {
  const [form, setForm] = useState({ descricao: "", nota: "" });
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = sintomaSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setError("");
    onSave({
      id: crypto.randomUUID(),
      descricao: parsed.data.descricao,
      data: "Hoje",
      nota: parsed.data.nota || "Sem observações",
    });
    setForm({ descricao: "", nota: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Registrar sintoma</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Sintoma"
            required
            value={form.descricao}
            onChange={set("descricao")}
            placeholder="Ex: Insônia, dor de cabeça"
          />
          <Field
            label="Intensidade ou nota"
            value={form.nota}
            onChange={set("nota")}
            placeholder="Ex: Moderada"
          />
          {error && (
            <p role="alert" className="text-xs text-danger-600">
              {error}
            </p>
          )}
          <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function HealthView() {
  const [activeTab, setActiveTab] = useState<TabId>("remedios");
  const [remedios, setRemedios] = useState<Medicamento[]>(mockUser.remedios);
  const [exames] = useState<Exame[]>(mockUser.exames);
  const [sintomas, setSintomas] = useState<Sintoma[]>(mockUser.sintomas);
  const [remedioOpen, setRemedioOpen] = useState(false);
  const [sintomaOpen, setSintomaOpen] = useState(false);

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
              "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
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
                <Button onClick={() => setRemedioOpen(true)}>
                  <Plus />
                  Adicionar remédio
                </Button>
              }
            />
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {remedios.map((item) => (
                <li key={item.id} className={cn(cardClass, "space-y-2")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={metaClass}>
                      {item.frequencia} • {item.horario}
                    </span>
                    <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600">
                      {item.dosagem}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{item.nome}</p>
                </li>
              ))}
            </ul>
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
                  <p className="text-xs font-medium text-brand-600">Resultado: {exame.resultado}</p>
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
                <Button onClick={() => setSintomaOpen(true)}>
                  <Plus />
                  Registrar sintoma
                </Button>
              }
            />
            <ul className="space-y-3">
              {sintomas.map((item) => (
                <li key={item.id} className={cn(cardClass, "space-y-1")}>
                  <span className={metaClass}>{item.data}</span>
                  <p className="text-lg font-bold text-foreground">{item.descricao}</p>
                  <p className="text-xs font-medium text-brand-600">Intensidade/nota: {item.nota}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <MedicamentoDialog
        open={remedioOpen}
        onOpenChange={setRemedioOpen}
        onSave={(item) => setRemedios((current) => [item, ...current])}
      />
      <SintomaDialog
        open={sintomaOpen}
        onOpenChange={setSintomaOpen}
        onSave={(item) => setSintomas((current) => [item, ...current])}
      />
    </Page>
  );
}
