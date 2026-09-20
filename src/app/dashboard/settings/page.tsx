"use client";

import { useState } from "react";
import { useUser } from "@/context/page";

// Componente do formulário isolado
function ProfileForm({
  user,
  updateUser,
  onSaveSuccess,
}: {
  user: { name: string; email: string } | null;
  updateUser: (data: { name: string; email: string }) => void;
  onSaveSuccess: () => void;
}) {
  // Inicializa diretamente com os dados do usuário
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      email: email.trim(),
    });
    onSaveSuccess();
  };

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
        Informações do Perfil
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Endereço de E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
        >
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useUser();

  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "security">("general");

  // Estados dos Toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSuccess = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Configurações <span className="text-emerald-600">da Conta</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie preferências de perfil, notificações e segurança.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-in fade-in">
            ✓ Alterações salvas!
          </span>
        )}
      </div>

      {/* Navegação por Abas */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === "general"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          👤 Geral & Perfil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === "notifications"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          🔔 Notificações
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === "security"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          🛡️ Segurança
        </button>
      </div>

      {/* Conteúdo da Aba Geral */}
      {activeTab === "general" && (
        <ProfileForm
          key={user?.email || "loading"}
          user={user}
          updateUser={updateUser}
          onSaveSuccess={handleSuccess}
        />
      )}

      {/* Conteúdo da Aba Notificações */}
      {activeTab === "notifications" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Preferências de Comunicação
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-xs text-slate-800">
                  Notificações por E-mail
                </p>
                <p className="text-[11px] text-slate-400">
                  Receba avisos de cobranças, faturas e novidades.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-xs text-slate-800">
                  Alertas por SMS
                </p>
                <p className="text-[11px] text-slate-400">
                  Receba lembretes no celular no dia do vencimento da fatura.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba Segurança */}
      {activeTab === "security" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-base">
              Segurança e Autenticação
            </h2>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
              Em desenvolvimento
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-xs text-slate-800">
                  Autenticação em Duas Etapas (2FA)
                </p>
                <p className="text-[11px] text-slate-400">
                  Adiciona uma camada extra de segurança usando o Google Authenticator.
                </p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600">Alterar senha da conta</span>
              <button
                type="button"
                onClick={() => alert("Recurso de troca de senha em breve!")}
                className="px-3 py-1.5 font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
              >
                Redefinir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}