"use client"

import { mockUser, Agendamento } from "@/data/mockData"

import { useState, FormEvent } from "react";
export default function Appointments() {
  const [appointments, setAppointments] = useState<Agendamento[]>(mockUser.agendamentos || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [profissional, setProfissional] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState<"online" | "presencial">("online");  

const handleCreateAppointment = (e: FormEvent) => {
    e.preventDefault();
    if (!profissional || !data || !hora) return;

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      profissional,
      data,
      hora,
      status: "pendente",
      tipo,
    };
  setAppointments([novoAgendamento, ...appointments]);
  

  setProfissional('');
  setTipo("online");
    setIsModalOpen(false);
    setData('');
    setHora('');
  };

return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Meus Agendamentos</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Novo Agendamento
        </button>
      </div>

     
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Agendar Nova Sessão</h2>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                <input 
                  type="text" 
                  value={profissional} 
                  onChange={(e) => setProfissional(e.target.value)}
                  placeholder="Ex: Dra. Ana Silva"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    value={data} 
                    onChange={(e) => setData(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input 
                    type="time" 
                    value={hora} 
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value as "online" | "presencial")}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl mb-8 shadow-sm">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">Próxima Sessão</h3>
        <div className="space-y-2 text-gray-700 mb-4">
          <p><strong>Profissional:</strong> {mockUser.nextSession.doctor}</p>
          <p><strong>Data:</strong> {mockUser.nextSession.date} às {mockUser.nextSession.time}</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
          Entrar na Sala
        </button>
      </div>

     
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Histórico</h2>
      <ul className="space-y-3">
        {appointments.map((item) => (
          <li 
            key={item.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm gap-2"
          >
            <div>
              <p className="font-medium text-gray-800">{item.profissional}</p>
              <p className="text-sm text-gray-500">{item.data} às {item.hora} ({item.tipo})</p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                item.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}