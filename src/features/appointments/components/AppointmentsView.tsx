"use client";

import { useState, type FormEvent } from "react";
import { mockUser } from "@/data/mockData";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { AppointmentType } from "@/features/appointments/types";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function AppointmentsView() {
  const { appointments, addAppointment } = useAppointments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState<AppointmentType>("online");
  const [formError, setFormError] = useState("");

  const handleCreateAppointment = (e: FormEvent) => {
    e.preventDefault();

    const result = addAppointment({
      profissional,
      data,
      hora,
      tipo,
    });

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormError("");
    setProfissional("");
    setTipo("online");
    setIsModalOpen(false);
    setData("");
    setHora("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-canvas min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <AnimatedText as="h1" text="Meus Agendamentos" className="text-2xl font-semibold text-ink" />
        <MagneticButton
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-800 text-white px-4 py-2 rounded-lg hover:bg-brand-900 transition"
        >
          + Novo Agendamento
        </MagneticButton>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent aria-describedby={undefined} className="gap-4 rounded-xl bg-surface p-6 sm:max-w-md">
          <DialogTitle className="text-xl font-semibold text-ink">Agendar Nova Sessão</DialogTitle>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profissional</label>
                <input
                  type="text"
                  value={profissional}
                  onChange={(e) => setProfissional(e.target.value)}
                  placeholder="Ex: Dra. Ana Silva"
                  className="w-full border border-neutral-200/70 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-800/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full border border-neutral-200/70 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-800/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full border border-neutral-200/70 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-800/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as AppointmentType)}
                  className="w-full border border-neutral-200/70 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-800/20"
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              {formError && <p className="text-xs text-red-600">{formError}</p>}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200/70 rounded-lg text-sm text-slate-600 hover:bg-neutral-100 transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-brand-800 text-white rounded-lg text-sm hover:bg-brand-900 transition">
                  Salvar
                </button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      <div className="bg-brand-50 border border-brand-100 p-6 rounded-xl mb-8 shadow-sm">
        <h3 className="text-lg font-semibold text-brand-900 mb-3">Próxima Sessão</h3>
        <div className="space-y-2 text-slate-700 mb-4">
          <p><strong>Profissional:</strong> {mockUser.nextSession.doctor}</p>
          <p><strong>Data:</strong> {mockUser.nextSession.date} às {mockUser.nextSession.time}</p>
        </div>
        <button className="bg-brand-800 text-white px-4 py-2 rounded-lg hover:bg-brand-900 transition text-sm font-medium">
          Entrar na Sala
        </button>
      </div>

      <h2 className="text-xl font-semibold text-ink mb-4">Histórico</h2>

      {appointments.length === 0 ? (
        <div className="bg-surface border border-black/5 rounded-xl p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-ink">Nenhum agendamento ainda</p>
          <p className="text-sm text-slate-600 mt-1">Comece adicionando sua primeira sessão com um profissional.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {appointments.map((item) => (
            <li key={item.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface border border-black/5 rounded-xl shadow-sm gap-2">
                <div>
                  <p className="font-medium text-ink">{item.profissional}</p>
                  <p className="text-sm text-slate-500">{item.data} às {item.hora} ({item.tipo})</p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "confirmado" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
