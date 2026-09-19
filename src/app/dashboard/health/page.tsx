"use client";

import { useState } from "react";
import { mockUser, Medicamento, Exame, Sintoma } from "@/data/mockData";

export default function HealthPage() {
  const [activeTab, setActiveTab] = useState<"remedios" | "exames" | "sintomas">("remedios");


  const [remedios, setRemedios] = useState<Medicamento[]>(mockUser.remedios);
  const [exames, setExames] = useState<Exame[]>(mockUser.exames);
  const [sintomas, setSintomas] = useState<Sintoma[]>(mockUser.sintomas);


  const [isRemedioModalOpen, setIsRemedioModalOpen] = useState(false);
  const [novoNomeRemedio, setNovoNomeRemedio] = useState("");
  const [novaDosagem, setNovaDosagem] = useState("");
  const [novaFrequencia, setNovaFrequencia] = useState("");
  const [novoHorario, setNovoHorario] = useState("");

  const [isSintomaModalOpen, setIsSintomaModalOpen] = useState(false);
  const [novaDescricaoSintoma, setNovaDescricaoSintoma] = useState("");
  const [novaNota, setNovaNota] = useState("");

  const handleAddRemedio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeRemedio || !novaDosagem) return;

    const novo: Medicamento = {
      id: Date.now().toString(),
      nome: novoNomeRemedio,
      dosagem: novaDosagem,
      frequencia: novaFrequencia || "Uso diário",
      horario: novoHorario || "Horário livre",
    };

    setRemedios([novo, ...remedios]);
    setNovoNomeRemedio("");
    setNovaDosagem("");
    setNovaFrequencia("");
    setNovoHorario("");
    setIsRemedioModalOpen(false);
  };

  const handleAddSintoma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDescricaoSintoma) return;

    const novo: Sintoma = {
      id: Date.now().toString(),
      descricao: novaDescricaoSintoma,
      data: "Hoje",
      nota: novaNota || "Sem observações",
    };

    setSintomas([novo, ...sintomas]);
    setNovaDescricaoSintoma("");
    setNovaNota("");
    setIsSintomaModalOpen(false);
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
   
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Gestão de <span className="text-emerald-600">Saúde</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Acompanhe seus medicamentos, exames e registe sintomas do dia a dia.
        </p>
      </div>


      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("remedios")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition whitespace-nowrap ${
            activeTab === "remedios"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Meus Remédios
        </button>
        <button
          onClick={() => setActiveTab("exames")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition whitespace-nowrap ${
            activeTab === "exames"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Meus Exames
        </button>
        <button
          onClick={() => setActiveTab("sintomas")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition whitespace-nowrap ${
            activeTab === "sintomas"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Meus Sintomas
        </button>
      </div>

   
      {activeTab === "remedios" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Medicamentos Ativos</h2>
            <button 
              onClick={() => setIsRemedioModalOpen(true)}
              className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              + Adicionar Remédio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {remedios.map((item) => (
              <div key={item.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {item.frequencia} • {item.horario}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {item.dosagem}
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-700">{item.nome}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    
      {activeTab === "exames" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Histórico de Exames</h2>
            <button className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-xl hover:bg-emerald-700 transition">
              + Enviar Exame
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exames.map((exame) => (
              <div key={exame.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data: {exame.data}</span>
                <p className="text-lg font-bold text-slate-700">{exame.titulo}</p>
                <p className="text-xs text-emerald-600 font-medium">Resultado: {exame.resultado}</p>
              </div>
            ))}
          </div>
        </div>
      )}


      {activeTab === "sintomas" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Registo de Sintomas</h2>
            <button 
              onClick={() => setIsSintomaModalOpen(true)}
              className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              + Registar Sintoma
            </button>
          </div>

          <div className="space-y-3">
            {sintomas.map((item) => (
              <div key={item.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.data}</span>
                <p className="text-lg font-bold text-slate-700">{item.descricao}</p>
                <p className="text-xs text-emerald-600 font-medium">Intensidade/Nota: {item.nota}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    
      {isRemedioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Novo Medicamento</h3>
            <form onSubmit={handleAddRemedio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome do Remédio</label>
                <input 
                  type="text" 
                  value={novoNomeRemedio} 
                  onChange={(e) => setNovoNomeRemedio(e.target.value)}
                  placeholder="Ex: Rivotril"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dosagem</label>
                <input 
                  type="text" 
                  value={novaDosagem} 
                  onChange={(e) => setNovaDosagem(e.target.value)}
                  placeholder="Ex: 2mg"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Frequência</label>
                  <input 
                    type="text" 
                    value={novaFrequencia} 
                    onChange={(e) => setNovaFrequencia(e.target.value)}
                    placeholder="Ex: Diária"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Horário</label>
                  <input 
                    type="text" 
                    value={novoHorario} 
                    onChange={(e) => setNovoHorario(e.target.value)}
                    placeholder="Ex: 21:00"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRemedioModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

   
      {isSintomaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Registar Sintoma</h3>
            <form onSubmit={handleAddSintoma} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Sintoma Sentido</label>
                <input 
                  type="text" 
                  value={novaDescricaoSintoma} 
                  onChange={(e) => setNovaDescricaoSintoma(e.target.value)}
                  placeholder="Ex: Insónia / Dor de cabeça"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Intensidade / Nota</label>
                <input 
                  type="text" 
                  value={novaNota} 
                  onChange={(e) => setNovaNota(e.target.value)}
                  placeholder="Ex: Moderada"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsSintomaModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}