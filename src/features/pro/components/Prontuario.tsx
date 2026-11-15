"use client";

import { useState } from "react";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { TabPanel, UnderlineTabs } from "@/components/ui/underline-tabs";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePro } from "../hooks/usePro";
import {
  anamnesisFields,
  CONDUCT_STATUS_LABEL,
  evolutionTemplate,
  FIELD_MAX,
  GOAL_LABEL,
  GOAL_MAX,
  NOTE_MAX,
  stampLabel,
} from "../prontuario";
import type { AnamnesisField, Goal, SessionNote } from "../types";
import { useProIdentity } from "./ProIdentity";
import { ExamsTab, MedicationTab } from "./ProntuarioClinico";

type Tab = "evolucao" | "anamnese" | "plano" | "medicacao" | "exames";
const BASE_TABS: { id: Tab; label: string }[] = [
  { id: "evolucao", label: "Evolução" },
  { id: "anamnese", label: "Anamnese" },
  { id: "plano", label: "Plano terapêutico" },
];
/** O psiquiatra tem duas abas a mais: o remédio é o centro da consulta. */
const PSYCHIATRY_TABS: { id: Tab; label: string }[] = [
  { id: "evolucao", label: "Evolução" },
  { id: "anamnese", label: "Anamnese" },
  { id: "plano", label: "Conduta" },
  { id: "medicacao", label: "Medicação" },
  { id: "exames", label: "Exames" },
];

const textarea = cn(fieldControlClass, "min-h-24 resize-y py-3");

/**
 * O prontuário do paciente: evolução de cada sessão, anamnese e plano terapêutico (ou conduta, no do médico).
 * Cada profissional tem o seu. Nada se apaga; corrigir guarda a versão anterior com data e hora.
 * Psicóloga: Resolução CFP 1/2009 (guarda de 5 anos). Psiquiatra: Resolução CFM 1.821/2007 (20 anos).
 */
export function Prontuario({ patientId, firstName }: { patientId: string; firstName: string }) {
  const [tab, setTab] = useState<Tab>("evolucao");
  const { specialty } = useProIdentity();
  const psychiatry = specialty === "psychiatrist";
  const TABS = psychiatry ? PSYCHIATRY_TABS : BASE_TABS;

  return (
    <Block title="Prontuário" size="lg">
      <p className="-mt-2 mb-4 text-xs leading-relaxed text-muted-foreground">
        Este prontuário é só seu: outro profissional não vê. Nada aqui se apaga: corrigir guarda a versão
        anterior. O registro é guardado por pelo menos{" "}
        {psychiatry ? "20 anos (CFM 1.821/2007)" : "5 anos (CFP 1/2009)"}. Não aparece no app de {firstName},
        mas {firstName} tem direito de pedir acesso.
      </p>
      <UnderlineTabs
        label="Partes do prontuário"
        tabs={TABS}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />
      <TabPanel key={tab} label={TABS.find((t) => t.id === tab)!.label}>
        {tab === "evolucao" && <Evolutions patientId={patientId} />}
        {tab === "anamnese" && <AnamnesisForm patientId={patientId} />}
        {tab === "plano" && <Plan patientId={patientId} />}
        {tab === "medicacao" && <MedicationTab patientId={patientId} firstName={firstName} />}
        {tab === "exames" && <ExamsTab patientId={patientId} firstName={firstName} />}
      </TabPanel>
    </Block>
  );
}

function Evolutions({ patientId }: { patientId: string }) {
  const pro = usePro();
  const { specialty } = useProIdentity();
  const [draft, setDraft] = useState("");
  const notes = pro.notes.filter((n) => n.patientId === patientId);
  const sessionHour = (note: SessionNote) => pro.sessions.find((s) => s.id === note.sessionId)?.hora;

  return (
    <div className="space-y-5">
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          pro.addNote(patientId, draft);
          setDraft("");
        }}
      >
        <label htmlFor="evo-nova" className="block text-sm font-semibold">
          Registrar evolução
        </label>
        <textarea
          id="evo-nova"
          rows={3}
          maxLength={NOTE_MAX}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Fora do Encerrar sessão: um contato, uma intercorrência, uma observação."
          className={textarea}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={!draft.trim()}>
            Guardar no prontuário
          </Button>
          {!draft.trim() && (
            <Button type="button" variant="ghost" onClick={() => setDraft(evolutionTemplate(specialty))}>
              Usar modelo
            </Button>
          )}
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma evolução ainda. Ao encerrar uma sessão, a evolução aparece aqui.
        </p>
      ) : (
        <ol className="space-y-1">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              hour={sessionHour(note)}
              onEdit={(text) => pro.editNote(note.id, text)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function NoteItem({
  note,
  hour,
  onEdit,
}: {
  note: SessionNote;
  hour?: string;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const [showVersions, setShowVersions] = useState(false);
  const versions = note.versions ?? [];
  const title = `${formatDateBR(note.date)}${note.sessionId ? ` · sessão${hour ? ` das ${hour}` : ""}` : " · registro avulso"}`;

  return (
    <li className="space-y-2 border-t border-sunken py-4 first:border-t-0">
      <h3 className="text-sm font-semibold">{title}</h3>
      {editing ? (
        <div className="space-y-2">
          <label htmlFor={`edit-${note.id}`} className="sr-only">
            Corrigir a evolução de {formatDateBR(note.date)}
          </label>
          <textarea
            id={`edit-${note.id}`}
            rows={4}
            maxLength={NOTE_MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={textarea}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onEdit(text);
                setEditing(false);
              }}
            >
              Salvar correção
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setText(note.text);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-base leading-relaxed whitespace-pre-wrap">{note.text}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
        {note.editedAt && <span>Corrigida em {stampLabel(note.editedAt)}</span>}
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-h-11 font-medium text-brand-ink underline"
          >
            Corrigir
          </button>
        )}
        {versions.length > 0 && (
          <button
            type="button"
            aria-expanded={showVersions}
            onClick={() => setShowVersions((v) => !v)}
            className="min-h-11 font-medium text-brand-ink underline"
          >
            {showVersions
              ? "Esconder versões anteriores"
              : `Ver ${versions.length} ${versions.length === 1 ? "versão anterior" : "versões anteriores"}`}
          </button>
        )}
      </div>

      {showVersions && (
        <ol aria-label="Versões anteriores" className="animate-rise space-y-2 border-l-2 border-border pl-4">
          {versions.map((v) => (
            <li key={v.until} className="text-sm">
              <span className="block text-xs text-muted-foreground">Valeu até {stampLabel(v.until)}</span>
              <span className="whitespace-pre-wrap text-muted-foreground">{v.text}</span>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

function AnamnesisForm({ patientId }: { patientId: string }) {
  const pro = usePro();
  const { specialty } = useProIdentity();
  const list = anamnesisFields(specialty);
  const current = pro.anamneses[patientId];
  const [fields, setFields] = useState<Partial<Record<AnamnesisField, string>>>(current?.fields ?? {});
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        pro.saveAnamnesis(patientId, fields);
        setSaved(true);
      }}
    >
      <p className="text-sm text-muted-foreground">
        {specialty === "psychiatrist"
          ? "A primeira consulta: queixa, história, antecedentes e exame do estado mental. Pode ser completada com o tempo."
          : "A avaliação da demanda, feita na primeira conversa. Pode ser completada com o tempo."}
      </p>
      {list.map((field) => (
        <div key={field.id} className="space-y-1">
          <label htmlFor={`anam-${field.id}`} className="block text-sm font-semibold">
            {field.label}
          </label>
          <p id={`anam-${field.id}-hint`} className="text-xs text-muted-foreground">
            {field.hint}
          </p>
          <textarea
            id={`anam-${field.id}`}
            aria-describedby={`anam-${field.id}-hint`}
            rows={2}
            maxLength={FIELD_MAX}
            value={fields[field.id] ?? ""}
            onChange={(e) => {
              setFields((f) => ({ ...f, [field.id]: e.target.value }));
              setSaved(false);
            }}
            className={textarea}
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Salvar anamnese</Button>
        <span role="status" className="text-xs text-muted-foreground">
          {saved ? "Salva. " : ""}
          {current ? `Atualizada em ${stampLabel(current.updatedAt)}.` : "Ainda não preenchida."}
        </span>
        {current && current.history.length > 0 && (
          <button
            type="button"
            aria-expanded={showHistory}
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-11 text-xs font-medium text-brand-ink underline"
          >
            {showHistory
              ? "Esconder versões anteriores"
              : current.history.length === 1
                ? "Ver 1 versão anterior"
                : `Ver ${current.history.length} versões anteriores`}
          </button>
        )}
      </div>
      {showHistory && current && (
        <ol
          aria-label="Versões anteriores da anamnese"
          className="animate-rise space-y-3 border-l-2 border-border pl-4"
        >
          {current.history.map((h) => (
            <li key={h.until} className="space-y-1 text-sm">
              <span className="block text-xs text-muted-foreground">Valeu até {stampLabel(h.until)}</span>
              {list
                .filter((f) => h.fields[f.id])
                .map((f) => (
                  <p key={f.id} className="text-muted-foreground">
                    <strong className="font-medium">{f.label}:</strong> {h.fields[f.id]}
                  </p>
                ))}
            </li>
          ))}
        </ol>
      )}
    </form>
  );
}

function Plan({ patientId }: { patientId: string }) {
  const pro = usePro();
  const psychiatry = useProIdentity().specialty === "psychiatrist";
  const labels = psychiatry ? CONDUCT_STATUS_LABEL : GOAL_LABEL;
  const [draft, setDraft] = useState("");
  const goals = pro.goals.filter((g) => g.patientId === patientId);
  const done = goals.filter((g) => g.status === "alcancado").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {psychiatry
          ? "O que foi decidido: remédio, dose, exames e retorno. A conduta de cada consulta encerrada entra aqui sozinha."
          : goals.length === 0
            ? "Os objetivos combinados com a pessoa. Alcançado ou revisto, o objetivo fica no histórico."
            : `${done} de ${goals.length} ${goals.length === 1 ? "objetivo alcançado" : "objetivos alcançados"}.`}
      </p>
      {goals.length > 0 && (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li key={goal.id} className="space-y-2 rounded-2xl border border-border p-4">
              <p
                className={cn("text-base", goal.status === "revisto" && "text-muted-foreground line-through")}
              >
                {goal.text}
              </p>
              <div role="group" aria-label={`Situação de: ${goal.text}`} className="flex flex-wrap gap-2">
                {(Object.keys(labels) as Goal["status"][]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={goal.status === status}
                    onClick={() => pro.setGoalStatus(goal.id, status)}
                    className={cn(
                      "min-h-9 rounded-full border px-3 text-xs transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                      goal.status === status
                        ? "border-primary bg-primary font-semibold text-primary-foreground"
                        : "border-border hover:border-brand-600",
                    )}
                  >
                    {labels[status]}
                  </button>
                ))}
                <span className="self-center text-xs text-muted-foreground">
                  desde {formatDateBR(goal.updatedAt ?? goal.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          pro.addGoal(patientId, draft);
          setDraft("");
        }}
      >
        <label htmlFor="novo-objetivo" className="sr-only">
          {psychiatry ? "Nova conduta" : "Novo objetivo"}
        </label>
        <input
          id="novo-objetivo"
          value={draft}
          maxLength={GOAL_MAX}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            psychiatry
              ? "Ex.: manter a dose e pedir TSH antes do retorno"
              : "Ex.: dormir pelo menos 6 horas na maioria das noites"
          }
          className={fieldControlClass}
        />
        <Button type="submit" className="shrink-0" disabled={!draft.trim()}>
          Adicionar
        </Button>
      </form>
    </div>
  );
}
