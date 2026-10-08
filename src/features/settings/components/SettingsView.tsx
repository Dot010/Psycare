"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Page } from "@/components/layout/Page";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { DataPanel } from "./DataPanel";
import { SharingPanel } from "./SharingPanel";
import { ReminderPanel } from "./ReminderPanel";

const profileSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().trim().email("E-mail inválido"),
});

const TABS = [
  { id: "general", label: "Perfil" },
  { id: "notifications", label: "Lembretes" },
  { id: "privacy", label: "Privacidade" },
  { id: "data", label: "Meus dados" },
  { id: "security", label: "Segurança" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const panelClass = "space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm";
const panelTitleClass = "text-base font-bold text-foreground";

function ProfileForm({
  user,
  updateUser,
  onSaved,
}: {
  user: { name: string; email: string } | null;
  updateUser: (data: { name: string; email: string }) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse({ name, email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setError("");
    updateUser(parsed.data);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className={panelClass}>
      <h2 className={cn(panelTitleClass, "border-b border-border pb-3")}>Informações do perfil</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Nome completo"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-border bg-sunken/50 p-3",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <span>
        <span className="block text-xs font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-brand-600"
      />
    </label>
  );
}

export default function SettingsView() {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saved, setSaved] = useState(false);

  const handleSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Page
      title="Configurações da Conta"
      description="Perfil, lembretes e os seus dados."
      actions={
        saved && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-ink"
          >
            <Check className="size-3.5" />
            Alterações salvas
          </span>
        )
      }
      width="narrow"
    >
      <div
        role="tablist"
        aria-label="Seções de configuração"
        className="flex gap-2 border-b border-border pb-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`settings-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`settings-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
              activeTab === tab.id ? "bg-strong text-white" : "text-muted-foreground hover:bg-sunken",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`settings-panel-${activeTab}`} aria-labelledby={`settings-tab-${activeTab}`}>
        {activeTab === "general" && (
          <ProfileForm
            key={user?.email ?? "loading"}
            user={user}
            updateUser={updateUser}
            onSaved={handleSaved}
          />
        )}

        {activeTab === "notifications" && <ReminderPanel />}

        {activeTab === "privacy" && <SharingPanel />}

        {activeTab === "data" && <DataPanel />}

        {activeTab === "security" && (
          <div className={panelClass}>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className={panelTitleClass}>Segurança e autenticação</h2>
              <span className="rounded-md bg-sun-100 px-2 py-0.5 text-xs font-semibold text-ink">
                Em desenvolvimento
              </span>
            </div>
            <div className="space-y-3">
              <ToggleRow
                title="Autenticação em duas etapas (2FA)"
                description="Adiciona uma camada extra de segurança com um aplicativo autenticador."
                checked={false}
                onChange={() => {}}
                disabled
              />
              <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-sunken p-4 text-xs">
                <span className="text-muted-foreground">Alterar senha da conta</span>
                <Button variant="outline" size="sm" disabled>
                  Redefinir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
